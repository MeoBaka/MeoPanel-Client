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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const audit_logs_entity_1 = require("../entities/audit-logs.entity");
let AuditService = class AuditService {
    constructor(auditLogsRepository) {
        this.auditLogsRepository = auditLogsRepository;
        this.auditTemplates = {
            [audit_logs_entity_1.AuditAction.USER_REGISTER]: {
                resource: audit_logs_entity_1.AuditResource.USER,
                template: (email) => `User registered with email: ${email}`,
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.USER_LOGIN]: {
                resource: audit_logs_entity_1.AuditResource.AUTH,
                template: (email) => `User logged in: ${email}`,
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.FAILED_LOGIN_ATTEMPT]: {
                resource: audit_logs_entity_1.AuditResource.AUTH,
                template: (email, reason) => `Failed login attempt for: ${email} - ${reason}`,
                isSuccess: false,
            },
            [audit_logs_entity_1.AuditAction.USER_LOGOUT]: {
                resource: audit_logs_entity_1.AuditResource.SESSION,
                template: () => 'User logged out',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.PASSWORD_CHANGE]: {
                resource: audit_logs_entity_1.AuditResource.PASSWORD,
                template: () => 'Password changed successfully',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.PASSWORD_RESET_REQUEST]: {
                resource: audit_logs_entity_1.AuditResource.PASSWORD,
                template: (email) => `Password reset requested for: ${email}`,
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.PASSWORD_RESET]: {
                resource: audit_logs_entity_1.AuditResource.PASSWORD,
                template: () => 'Password reset completed',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.EMAIL_VERIFICATION_SENT]: {
                resource: audit_logs_entity_1.AuditResource.EMAIL,
                template: (email) => `Email verification sent to: ${email}`,
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.EMAIL_VERIFIED]: {
                resource: audit_logs_entity_1.AuditResource.EMAIL,
                template: (email) => `Email verified: ${email}`,
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.TWO_FA_SETUP]: {
                resource: audit_logs_entity_1.AuditResource.TWO_FA,
                template: () => 'Two-factor authentication setup initiated',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.TWO_FA_ENABLED]: {
                resource: audit_logs_entity_1.AuditResource.TWO_FA,
                template: () => 'Two-factor authentication enabled',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.TWO_FA_DISABLED]: {
                resource: audit_logs_entity_1.AuditResource.TWO_FA,
                template: () => 'Two-factor authentication disabled',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.TWO_FA_BACKUP_USED]: {
                resource: audit_logs_entity_1.AuditResource.TWO_FA,
                template: () => 'Two-factor backup code used',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.TWO_FA_BACKUP_REGENERATED]: {
                resource: audit_logs_entity_1.AuditResource.TWO_FA,
                template: () => 'Two-factor backup codes regenerated',
                isSuccess: true,
            },
            [audit_logs_entity_1.AuditAction.SUSPICIOUS_ACTIVITY]: {
                resource: audit_logs_entity_1.AuditResource.SYSTEM,
                template: (details) => details,
                isSuccess: false,
            },
        };
    }
    async log(data) {
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
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
        }
    }
    async logAction(action, userId, params = [], options = {}) {
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
    async logUserRegistration(userId, email, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.USER_REGISTER, userId, [email], { ipAddress, userAgent, metadata: { email } });
    }
    async logUserLogin(userId, email, ipAddress, userAgent, sessionId) {
        await this.logAction(audit_logs_entity_1.AuditAction.USER_LOGIN, userId, [email], { ipAddress, userAgent, sessionId, metadata: { email } });
    }
    async logFailedLogin(email, reason, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.FAILED_LOGIN_ATTEMPT, undefined, [email, reason], { ipAddress, userAgent, metadata: { email, reason } });
    }
    async logUserLogout(userId, sessionId, ipAddress) {
        await this.logAction(audit_logs_entity_1.AuditAction.USER_LOGOUT, userId, [], { ipAddress, sessionId });
    }
    async logPasswordChange(userId, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.PASSWORD_CHANGE, userId, [], { ipAddress, userAgent });
    }
    async logPasswordResetRequest(email, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.PASSWORD_RESET_REQUEST, undefined, [email], { ipAddress, userAgent, metadata: { email } });
    }
    async logPasswordReset(userId, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.PASSWORD_RESET, userId, [], { ipAddress, userAgent });
    }
    async logEmailVerificationSent(userId, email) {
        await this.logAction(audit_logs_entity_1.AuditAction.EMAIL_VERIFICATION_SENT, userId, [email], { metadata: { email } });
    }
    async logEmailVerified(userId, email) {
        await this.logAction(audit_logs_entity_1.AuditAction.EMAIL_VERIFIED, userId, [email], { metadata: { email } });
    }
    async logTwoFASetup(userId, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.TWO_FA_SETUP, userId, [], { ipAddress, userAgent });
    }
    async logTwoFAEnabled(userId, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.TWO_FA_ENABLED, userId, [], { ipAddress, userAgent });
    }
    async logTwoFADisabled(userId, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.TWO_FA_DISABLED, userId, [], { ipAddress, userAgent });
    }
    async logTwoFABackupUsed(userId, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.TWO_FA_BACKUP_USED, userId, [], { ipAddress, userAgent });
    }
    async logTwoFABackupRegenerated(userId, ipAddress, userAgent) {
        await this.logAction(audit_logs_entity_1.AuditAction.TWO_FA_BACKUP_REGENERATED, userId, [], { ipAddress, userAgent });
    }
    async logSuspiciousActivity(userId, details, ipAddress, metadata) {
        await this.logAction(audit_logs_entity_1.AuditAction.SUSPICIOUS_ACTIVITY, userId, [details], { ipAddress, metadata });
    }
    async getUserAuditLogs(userId, limit = 50, offset = 0) {
        return this.auditLogsRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getAuditLogsByAction(action, limit = 50, offset = 0) {
        return this.auditLogsRepository.find({
            where: { action },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getAuditLogsByResource(resource, limit = 50, offset = 0) {
        return this.auditLogsRepository.find({
            where: { resource },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getRecentAuditLogs(limit = 100) {
        return this.auditLogsRepository.find({
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['user'],
        });
    }
};
exports.AuditService = AuditService;
exports.AuditService = AuditService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(audit_logs_entity_1.AuditLogs)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AuditService);
//# sourceMappingURL=audit.service.js.map