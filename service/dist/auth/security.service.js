"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SecurityService = exports.RolesGuard = exports.Roles = exports.ROLES_KEY = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const crypto = require("crypto");
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
let RolesGuard = class RolesGuard {
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const requiredRoles = this.reflector.getAllAndOverride(exports.ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredRoles) {
            return true;
        }
        const { user } = context.switchToHttp().getRequest();
        if (!user || !user.role) {
            throw new common_1.ForbiddenException('User role not found');
        }
        const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
        const hasRole = rolesArray.some(role => user.role === role);
        if (!hasRole) {
            throw new common_1.ForbiddenException('Insufficient permissions');
        }
        return true;
    }
};
exports.RolesGuard = RolesGuard;
exports.RolesGuard = RolesGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], RolesGuard);
let SecurityService = class SecurityService {
    constructor() {
        this.rateLimitCache = new Map();
    }
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            throw new common_1.BadRequestException('Input must be a string');
        }
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+\s*=/gi, '')
            .trim();
    }
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    validatePassword(password) {
        const errors = [];
        if (password.length < 8) {
            errors.push('Password must be at least 8 characters long');
        }
        if (!/[A-Z]/.test(password)) {
            errors.push('Password must contain at least one uppercase letter');
        }
        if (!/[a-z]/.test(password)) {
            errors.push('Password must contain at least one lowercase letter');
        }
        if (!/\d/.test(password)) {
            errors.push('Password must contain at least one number');
        }
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            errors.push('Password must contain at least one special character');
        }
        return {
            isValid: errors.length === 0,
            errors
        };
    }
    generateSecureToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    hashForLogging(value) {
        return crypto.createHash('sha256').update(value).digest('hex').substring(0, 8);
    }
    detectSuspiciousInput(input) {
        const suspiciousPatterns = [
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/i,
            /(\b(OR|AND)\b.*(=|>|<))/i,
            /('|(\\x27)|(\\x2D\\x2D)|(\-\-)|(\\x23)|(#))/i,
            /(<script|javascript:|on\w+=)/i,
            /(\b(UNION|EXEC|EXECUTE)\b)/i,
        ];
        return suspiciousPatterns.some(pattern => pattern.test(input));
    }
    checkRateLimit(key, maxRequests, windowMs) {
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
    cleanupRateLimit() {
        const now = Date.now();
        for (const [key, value] of this.rateLimitCache.entries()) {
            if (now > value.resetTime) {
                this.rateLimitCache.delete(key);
            }
        }
    }
    validateAndSanitizeUserInput(input) {
        if (typeof input === 'string') {
            const sanitized = this.sanitizeInput(input);
            if (this.detectSuspiciousInput(sanitized)) {
                throw new common_1.BadRequestException('Input contains suspicious content');
            }
            return sanitized;
        }
        if (typeof input === 'object' && input !== null) {
            const sanitized = {};
            for (const [key, value] of Object.entries(input)) {
                if (typeof value === 'string') {
                    sanitized[key] = this.sanitizeInput(value);
                    if (this.detectSuspiciousInput(sanitized[key])) {
                        throw new common_1.BadRequestException(`Field '${key}' contains suspicious content`);
                    }
                }
                else {
                    sanitized[key] = value;
                }
            }
            return sanitized;
        }
        return input;
    }
};
exports.SecurityService = SecurityService;
exports.SecurityService = SecurityService = __decorate([
    (0, common_1.Injectable)()
], SecurityService);
//# sourceMappingURL=security.service.js.map