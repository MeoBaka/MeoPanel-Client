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
exports.WserverController = void 0;
const common_1 = require("@nestjs/common");
const wserver_service_1 = require("./wserver.service");
const dto_1 = require("../dto");
const jwt_1 = require("../jwt");
const security_service_1 = require("../auth/security.service");
const user_entity_1 = require("../entities/user.entity");
let WserverController = class WserverController {
    constructor(wserverService) {
        this.wserverService = wserverService;
    }
    async create(wserverData) {
        const wserver = await this.wserverService.create(wserverData);
        return { message: 'Wserver created successfully', data: wserver };
    }
    async findAll(req) {
        const user = req.user;
        const wservers = await this.wserverService.findAllForUser(user.id, user.role);
        return { message: 'Wservers retrieved successfully', data: wservers };
    }
    async findOne(id) {
        const wserver = await this.wserverService.findOne(id);
        return { message: 'Wserver retrieved successfully', data: wserver };
    }
    async update(id, wserverData) {
        const wserver = await this.wserverService.update(id, wserverData);
        return { message: 'Wserver updated successfully', data: wserver };
    }
    async remove(id) {
        await this.wserverService.remove(id);
        return { message: 'Wserver deleted successfully' };
    }
    async getStatus(id) {
        const status = await this.wserverService.getServerStatus(id);
        return { message: 'Server status retrieved successfully', data: status };
    }
};
exports.WserverController = WserverController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.UseGuards)(security_service_1.RolesGuard),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateWserverDto]),
    __metadata("design:returntype", Promise)
], WserverController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], WserverController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WserverController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, common_1.UseGuards)(security_service_1.RolesGuard),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateWserverDto]),
    __metadata("design:returntype", Promise)
], WserverController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.UseGuards)(security_service_1.RolesGuard),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WserverController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)(':id/status'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WserverController.prototype, "getStatus", null);
exports.WserverController = WserverController = __decorate([
    (0, common_1.Controller)('wservers'),
    __metadata("design:paramtypes", [wserver_service_1.WserverService])
], WserverController);
//# sourceMappingURL=wserver.controller.js.map