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
exports.AuditController = void 0;
const common_1 = require("@nestjs/common");
const audit_service_1 = require("./audit.service");
const jwt_auth_guard_1 = require("../jwt/jwt-auth.guard");
const audit_logs_entity_1 = require("../entities/audit-logs.entity");
let AuditController = class AuditController {
    constructor(auditService) {
        this.auditService = auditService;
    }
    async getAuditLogs(username, action, resource, startDate, endDate, limit, offset) {
        const limitNum = limit ? parseInt(limit) : 50;
        const offsetNum = offset ? parseInt(offset) : 0;
        const filters = {
            username,
            action,
            resource,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        };
        const [logs, total] = await this.auditService.getFilteredAuditLogs(filters, limitNum, offsetNum);
        return {
            logs,
            total,
            page: Math.floor(offsetNum / limitNum) + 1,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }
    async getAuditStats() {
        const recentLogs = await this.auditService.getRecentAuditLogs(1000);
        const stats = {
            total: recentLogs.length,
            byAction: {},
            byResource: {},
            recentActivity: recentLogs.slice(0, 10),
        };
        recentLogs.forEach(log => {
            stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
        });
        recentLogs.forEach(log => {
            stats.byResource[log.resource] = (stats.byResource[log.resource] || 0) + 1;
        });
        return stats;
    }
};
exports.AuditController = AuditController;
__decorate([
    (0, common_1.Get)('logs'),
    __param(0, (0, common_1.Query)('username')),
    __param(1, (0, common_1.Query)('action')),
    __param(2, (0, common_1.Query)('resource')),
    __param(3, (0, common_1.Query)('startDate')),
    __param(4, (0, common_1.Query)('endDate')),
    __param(5, (0, common_1.Query)('limit')),
    __param(6, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditLogs", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuditController.prototype, "getAuditStats", null);
exports.AuditController = AuditController = __decorate([
    (0, common_1.Controller)('audit'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [audit_service_1.AuditService])
], AuditController);
//# sourceMappingURL=audit.controller.js.map