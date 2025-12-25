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
exports.AuditLogs = exports.AuditResource = exports.AuditAction = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
var AuditAction;
(function (AuditAction) {
    AuditAction["USER_REGISTER"] = "USER_REGISTER";
    AuditAction["USER_LOGIN"] = "USER_LOGIN";
    AuditAction["USER_LOGOUT"] = "USER_LOGOUT";
    AuditAction["USER_LOGOUT_ALL"] = "USER_LOGOUT_ALL";
    AuditAction["PASSWORD_CHANGE"] = "PASSWORD_CHANGE";
    AuditAction["PASSWORD_RESET_REQUEST"] = "PASSWORD_RESET_REQUEST";
    AuditAction["PASSWORD_RESET"] = "PASSWORD_RESET";
    AuditAction["EMAIL_VERIFICATION_SENT"] = "EMAIL_VERIFICATION_SENT";
    AuditAction["EMAIL_VERIFIED"] = "EMAIL_VERIFIED";
    AuditAction["TWO_FA_SETUP"] = "TWO_FA_SETUP";
    AuditAction["TWO_FA_ENABLED"] = "TWO_FA_ENABLED";
    AuditAction["TWO_FA_DISABLED"] = "TWO_FA_DISABLED";
    AuditAction["TWO_FA_BACKUP_USED"] = "TWO_FA_BACKUP_USED";
    AuditAction["TWO_FA_BACKUP_REGENERATED"] = "TWO_FA_BACKUP_REGENERATED";
    AuditAction["USER_CREATED"] = "USER_CREATED";
    AuditAction["USER_UPDATED"] = "USER_UPDATED";
    AuditAction["USER_DELETED"] = "USER_DELETED";
    AuditAction["FAILED_LOGIN_ATTEMPT"] = "FAILED_LOGIN_ATTEMPT";
    AuditAction["SUSPICIOUS_ACTIVITY"] = "SUSPICIOUS_ACTIVITY";
    AuditAction["TOKEN_REFRESH"] = "TOKEN_REFRESH";
    AuditAction["SYSTEM_MAINTENANCE"] = "SYSTEM_MAINTENANCE";
    AuditAction["CONFIGURATION_CHANGE"] = "CONFIGURATION_CHANGE";
})(AuditAction || (exports.AuditAction = AuditAction = {}));
var AuditResource;
(function (AuditResource) {
    AuditResource["USER"] = "USER";
    AuditResource["AUTH"] = "AUTH";
    AuditResource["SESSION"] = "SESSION";
    AuditResource["PASSWORD"] = "PASSWORD";
    AuditResource["EMAIL"] = "EMAIL";
    AuditResource["TWO_FA"] = "TWO_FA";
    AuditResource["SYSTEM"] = "SYSTEM";
})(AuditResource || (exports.AuditResource = AuditResource = {}));
let AuditLogs = class AuditLogs {
};
exports.AuditLogs = AuditLogs;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true, name: 'user_id' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], AuditLogs.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AuditAction, name: 'action' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "action", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: AuditResource, name: 'resource' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "resource", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'details' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 45, nullable: true, name: 'ip_address' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, name: 'user_agent' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'session_id' }),
    __metadata("design:type", String)
], AuditLogs.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true, name: 'metadata' }),
    __metadata("design:type", Object)
], AuditLogs.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0, name: 'is_success' }),
    __metadata("design:type", Number)
], AuditLogs.prototype, "isSuccess", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', name: 'created_at' }),
    __metadata("design:type", Date)
], AuditLogs.prototype, "createdAt", void 0);
exports.AuditLogs = AuditLogs = __decorate([
    (0, typeorm_1.Entity)('audit_logs'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['action', 'createdAt']),
    (0, typeorm_1.Index)(['resource', 'createdAt'])
], AuditLogs);
//# sourceMappingURL=audit-logs.entity.js.map