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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const two_factor_service_1 = require("../twofa/two-factor.service");
const jwt_1 = require("../jwt");
const security_service_1 = require("./security.service");
const user_entity_1 = require("../entities/user.entity");
const dto_1 = require("../dto");
let AuthController = class AuthController {
    constructor(authService, twoFactorService) {
        this.authService = authService;
        this.twoFactorService = twoFactorService;
    }
    async register(body) {
        return this.authService.register(body);
    }
    async login(body, req) {
        return this.authService.login(body, req.ip, req.get('User-Agent'));
    }
    async refresh(body) {
        return this.authService.refreshToken(body.refreshToken);
    }
    getProfile(req) {
        return req.user;
    }
    async forgotPassword(body) {
        return this.authService.forgotPassword(body.email);
    }
    async resetPassword(body) {
        return this.authService.resetPassword(body.token, body.newPassword);
    }
    async changePassword(req, body) {
        return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword, req.ip, req.get('User-Agent'));
    }
    async logout(body, req) {
        return this.authService.logout(body.refreshToken, req.ip, req.get('User-Agent'));
    }
    async logoutAll(req) {
        return this.authService.logoutAll(req.user.id);
    }
    async setupTwoFactor(req) {
        return this.twoFactorService.setupTwoFactor(req.user.id);
    }
    async verifyTwoFactor(req, body) {
        return this.twoFactorService.verifyAndEnableTwoFactor(req.user.id, body.token);
    }
    async disableTwoFactor(req) {
        return this.twoFactorService.disableTwoFactor(req.user.id);
    }
    async regenerateBackupCodes(req) {
        return this.twoFactorService.regenerateBackupCodes(req.user.id);
    }
    async getTwoFactorStatus(req) {
        return this.twoFactorService.getTwoFactorStatus(req.user.id);
    }
    async getAllUsers() {
        return this.authService.getAllUsers();
    }
    async getSessions(req) {
        return this.authService.getUserSessions(req.user.id);
    }
    async logoutSession(req, body) {
        return this.authService.logoutSession(req.user.id, body.sessionId, req.user.sessionId);
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.RegisterDto]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refresh", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], AuthController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('forgot-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgotPassword", null);
__decorate([
    (0, common_1.Post)('reset-password'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('change-password'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('logout-all'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutAll", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('2fa/setup'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "setupTwoFactor", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('2fa/verify'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyTwoFactor", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('2fa/disable'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "disableTwoFactor", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('2fa/regenerate-backup'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "regenerateBackupCodes", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('2fa/status'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getTwoFactorStatus", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard, security_service_1.RolesGuard),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    (0, common_1.Get)('users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getAllUsers", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Get)('sessions'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getSessions", null);
__decorate([
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    (0, common_1.Post)('logout-session'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logoutSession", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        two_factor_service_1.TwoFactorService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map