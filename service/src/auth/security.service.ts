import { Injectable, BadRequestException, CanActivate, ExecutionContext, ForbiddenException, SetMetadata } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../entities/user.entity';
import * as crypto from 'crypto';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole | UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    // Convert single role to array for consistent handling
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Check if user has required role
    const hasRole = rolesArray.some(role => user.role === role);

    if (!hasRole) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}

@Injectable()
export class SecurityService {
  // Input sanitization
  sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      throw new BadRequestException('Input must be a string');
    }

    // Remove potentially dangerous characters
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
      .trim();
  }

  // Validate email format
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate password strength
  validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Generate secure random token
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  // Hash sensitive data for logging (without revealing actual values)
  hashForLogging(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex').substring(0, 8);
  }

  // Check for suspicious patterns
  detectSuspiciousInput(input: string): boolean {
    const suspiciousPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
      /(\b(OR|AND)\b.*(=|>|<))/i,
      /('|(\\x27)|(\\x2D\\x2D)|(\-\-)|(\\x23)|(#))/i,
      /(<script|javascript:|on\w+=)/i,
      /(\b(UNION|EXEC|EXECUTE)\b)/i,
    ];

    return suspiciousPatterns.some(pattern => pattern.test(input));
  }

  // Rate limiting helper (basic implementation)
  private rateLimitCache = new Map<string, { count: number; resetTime: number }>();

  checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now();
    const existing = this.rateLimitCache.get(key);

    if (!existing || now > existing.resetTime) {
      this.rateLimitCache.set(key, { count: 1, resetTime: now + windowMs });
      return true;
    }

    if (existing.count >= maxRequests) {
      return false;
    }

    existing.count++;
    return true;
  }

  // Clean up expired rate limit entries
  cleanupRateLimit(): void {
    const now = Date.now();
    for (const [key, value] of this.rateLimitCache.entries()) {
      if (now > value.resetTime) {
        this.rateLimitCache.delete(key);
      }
    }
  }

  // Validate and sanitize user input
  validateAndSanitizeUserInput(input: any): any {
    if (typeof input === 'string') {
      const sanitized = this.sanitizeInput(input);
      if (this.detectSuspiciousInput(sanitized)) {
        throw new BadRequestException('Input contains suspicious content');
      }
      return sanitized;
    }

    if (typeof input === 'object' && input !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(input)) {
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeInput(value);
          if (this.detectSuspiciousInput(sanitized[key])) {
            throw new BadRequestException(`Field '${key}' contains suspicious content`);
          }
        } else {
          sanitized[key] = value;
        }
      }
      return sanitized;
    }

    return input;
  }
}