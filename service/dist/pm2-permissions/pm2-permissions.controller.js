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
exports.PM2PermissionsController = void 0;
const common_1 = require("@nestjs/common");
const pm2_permissions_service_1 = require("./pm2-permissions.service");
const dto_1 = require("../dto");
const jwt_auth_guard_1 = require("../jwt/jwt-auth.guard");
let PM2PermissionsController = class PM2PermissionsController {
    constructor(pm2PermissionsService) {
        this.pm2PermissionsService = pm2PermissionsService;
    }
    create(createPM2PermissionDto) {
        return this.pm2PermissionsService.create(createPM2PermissionDto);
    }
    upsert(createPM2PermissionDto) {
        return this.pm2PermissionsService.upsert(createPM2PermissionDto);
    }
    findAll() {
        return this.pm2PermissionsService.findAll();
    }
    findByUser(userId) {
        return this.pm2PermissionsService.findByUser(userId);
    }
    findByUserAndServer(userId, serverId) {
        return this.pm2PermissionsService.findByUserAndServer(userId, serverId);
    }
    findOne(id) {
        return this.pm2PermissionsService.findOne(id);
    }
    update(id, updatePM2PermissionDto) {
        return this.pm2PermissionsService.update(id, updatePM2PermissionDto);
    }
    remove(id) {
        return this.pm2PermissionsService.remove(id);
    }
};
exports.PM2PermissionsController = PM2PermissionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePM2PermissionDto]),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('upsert'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreatePM2PermissionDto]),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "upsert", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "findByUser", null);
__decorate([
    (0, common_1.Get)('user/:userId/server/:serverId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Param)('serverId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "findByUserAndServer", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdatePM2PermissionDto]),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PM2PermissionsController.prototype, "remove", null);
exports.PM2PermissionsController = PM2PermissionsController = __decorate([
    (0, common_1.Controller)('pm2-permissions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [pm2_permissions_service_1.PM2PermissionsService])
], PM2PermissionsController);
//# sourceMappingURL=pm2-permissions.controller.js.map