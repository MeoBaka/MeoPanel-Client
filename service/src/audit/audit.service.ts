import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLogs, AuditAction, AuditResource } from '../entities/audit-logs.entity';
import { AuditLogDto } from '../dto';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLogs)
    private auditLogsRepository: Repository<AuditLogs>,
  ) {}

  async log(data: AuditLogDto): Promise<void> {
    try {
      const auditLog = this.auditLogsRepository.create({
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        details: data.details,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
        sessionId: data.sessionId,
        metadata: data.metadata,
        isSuccess: data.isSuccess !== undefined ? (data.isSuccess ? 1 : 0) : 1,
      });

      await this.auditLogsRepository.save(auditLog);
    } catch (error) {
      // Log audit failure but don't throw to avoid breaking main functionality
      console.error('Failed to create audit log:', error);
    }
  }

  // Predefined audit templates for common actions
  private readonly auditTemplates = {
    [AuditAction.USER_REGISTER]: {
      resource: AuditResource.USER,
      template: (email: string) => `User registered with email: ${email}`,
      isSuccess: true,
    },
    [AuditAction.USER_LOGIN]: {
      resource: AuditResource.AUTH,
      template: (email: string) => `User logged in: ${email}`,
      isSuccess: true,
    },
    [AuditAction.FAILED_LOGIN_ATTEMPT]: {
      resource: AuditResource.AUTH,
      template: (email: string, reason: string) => `Failed login attempt for: ${email} - ${reason}`,
      isSuccess: false,
    },
    [AuditAction.USER_LOGOUT]: {
      resource: AuditResource.SESSION,
      template: () => 'User logged out',
      isSuccess: true,
    },
    [AuditAction.PASSWORD_CHANGE]: {
      resource: AuditResource.PASSWORD,
      template: () => 'Password changed successfully',
      isSuccess: true,
    },
    [AuditAction.PASSWORD_RESET_REQUEST]: {
      resource: AuditResource.PASSWORD,
      template: (email: string) => `Password reset requested for: ${email}`,
      isSuccess: true,
    },
    [AuditAction.PASSWORD_RESET]: {
      resource: AuditResource.PASSWORD,
      template: () => 'Password reset completed',
      isSuccess: true,
    },
    [AuditAction.EMAIL_VERIFICATION_SENT]: {
      resource: AuditResource.EMAIL,
      template: (email: string) => `Email verification sent to: ${email}`,
      isSuccess: true,
    },
    [AuditAction.EMAIL_VERIFIED]: {
      resource: AuditResource.EMAIL,
      template: (email: string) => `Email verified: ${email}`,
      isSuccess: true,
    },
    [AuditAction.TWO_FA_SETUP]: {
      resource: AuditResource.TWO_FA,
      template: () => 'Two-factor authentication setup initiated',
      isSuccess: true,
    },
    [AuditAction.TWO_FA_ENABLED]: {
      resource: AuditResource.TWO_FA,
      template: () => 'Two-factor authentication enabled',
      isSuccess: true,
    },
    [AuditAction.TWO_FA_DISABLED]: {
      resource: AuditResource.TWO_FA,
      template: () => 'Two-factor authentication disabled',
      isSuccess: true,
    },
    [AuditAction.TWO_FA_BACKUP_USED]: {
      resource: AuditResource.TWO_FA,
      template: () => 'Two-factor backup code used',
      isSuccess: true,
    },
    [AuditAction.TWO_FA_BACKUP_REGENERATED]: {
      resource: AuditResource.TWO_FA,
      template: () => 'Two-factor backup codes regenerated',
      isSuccess: true,
    },
    [AuditAction.SUSPICIOUS_ACTIVITY]: {
      resource: AuditResource.SYSTEM,
      template: (details: string) => details,
      isSuccess: false,
    },
  };

  // Generic method for predefined audit actions
  async logAction(
    action: AuditAction,
    userId?: string,
    params: any[] = [],
    options: {
      ipAddress?: string;
      userAgent?: string;
      sessionId?: string;
      metadata?: any;
    } = {}
  ): Promise<void> {
    const template = this.auditTemplates[action];
    if (!template) {
      throw new Error(`Unknown audit action: ${action}`);
    }

    const details = template.template(...params);

    await this.log({
      userId,
      action,
      resource: template.resource,
      details,
      ipAddress: options.ipAddress,
      userAgent: options.userAgent,
      sessionId: options.sessionId,
      metadata: options.metadata,
      isSuccess: template.isSuccess,
    });
  }

  // Convenience methods using the generic logAction
  async logUserRegistration(userId: string, email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.USER_REGISTER, userId, [email], { ipAddress, userAgent, metadata: { email } });
  }

  async logUserLogin(userId: string, email: string, ipAddress?: string, userAgent?: string, sessionId?: string): Promise<void> {
    await this.logAction(AuditAction.USER_LOGIN, userId, [email], { ipAddress, userAgent, sessionId, metadata: { email } });
  }

  async logFailedLogin(email: string, reason: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.FAILED_LOGIN_ATTEMPT, undefined, [email, reason], { ipAddress, userAgent, metadata: { email, reason } });
  }

  async logUserLogout(userId: string, sessionId?: string, ipAddress?: string): Promise<void> {
    await this.logAction(AuditAction.USER_LOGOUT, userId, [], { ipAddress, sessionId });
  }

  async logPasswordChange(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.PASSWORD_CHANGE, userId, [], { ipAddress, userAgent });
  }

  async logPasswordResetRequest(email: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.PASSWORD_RESET_REQUEST, undefined, [email], { ipAddress, userAgent, metadata: { email } });
  }

  async logPasswordReset(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.PASSWORD_RESET, userId, [], { ipAddress, userAgent });
  }

  async logEmailVerificationSent(userId: string, email: string): Promise<void> {
    await this.logAction(AuditAction.EMAIL_VERIFICATION_SENT, userId, [email], { metadata: { email } });
  }

  async logEmailVerified(userId: string, email: string): Promise<void> {
    await this.logAction(AuditAction.EMAIL_VERIFIED, userId, [email], { metadata: { email } });
  }

  async logTwoFASetup(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.TWO_FA_SETUP, userId, [], { ipAddress, userAgent });
  }

  async logTwoFAEnabled(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.TWO_FA_ENABLED, userId, [], { ipAddress, userAgent });
  }

  async logTwoFADisabled(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.TWO_FA_DISABLED, userId, [], { ipAddress, userAgent });
  }

  async logTwoFABackupUsed(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.TWO_FA_BACKUP_USED, userId, [], { ipAddress, userAgent });
  }

  async logTwoFABackupRegenerated(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logAction(AuditAction.TWO_FA_BACKUP_REGENERATED, userId, [], { ipAddress, userAgent });
  }

  async logSuspiciousActivity(userId: string | undefined, details: string, ipAddress?: string, metadata?: any): Promise<void> {
    await this.logAction(AuditAction.SUSPICIOUS_ACTIVITY, userId, [details], { ipAddress, metadata });
  }

  // Query methods for retrieving audit logs
  async getUserAuditLogs(userId: string, limit: number = 50, offset: number = 0): Promise<AuditLogs[]> {
    return this.auditLogsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getAuditLogsByAction(action: AuditAction, limit: number = 50, offset: number = 0): Promise<AuditLogs[]> {
    return this.auditLogsRepository.find({
      where: { action },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getAuditLogsByResource(resource: AuditResource, limit: number = 50, offset: number = 0): Promise<AuditLogs[]> {
    return this.auditLogsRepository.find({
      where: { resource },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async getRecentAuditLogs(limit: number = 100): Promise<AuditLogs[]> {
    return this.auditLogsRepository.find({
      order: { createdAt: 'DESC' },
      take: limit,
      relations: ['user'],
    });
  }
}