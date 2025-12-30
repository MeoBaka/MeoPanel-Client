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
exports.UserController = void 0;
const common_1 = require("@nestjs/common");
const user_service_1 = require("./user.service");
const dto_1 = require("../dto");
const jwt_1 = require("../jwt");
const security_service_1 = require("../auth/security.service");
const user_entity_1 = require("../entities/user.entity");
let UserController = class UserController {
    constructor(userService) {
        this.userService = userService;
    }
    async create(userData) {
        const user = await this.userService.create(userData);
        return { message: 'User created successfully', data: user };
    }
    async findAll() {
        const users = await this.userService.findAll();
        return { message: 'Users retrieved successfully', data: users };
    }
    async findOne(uuid) {
        const user = await this.userService.findOne(uuid);
        return { message: 'User retrieved successfully', data: user };
    }
    async update(uuid, userData) {
        const user = await this.userService.update(uuid, userData);
        return { message: 'User updated successfully', data: user };
    }
    async updateRole(uuid, roleData) {
        const user = await this.userService.updateRole(uuid, roleData);
        return { message: 'User role updated successfully', data: user };
    }
    async updateStatus(uuid, statusData) {
        const user = await this.userService.updateStatus(uuid, statusData);
        return { message: 'User status updated successfully', data: user };
    }
    async remove(uuid) {
        await this.userService.remove(uuid);
        return { message: 'User deleted successfully' };
    }
};
exports.UserController = UserController;
__decorate([
    (0, common_1.Post)(),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [dto_1.CreateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':uuid'),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('uuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':uuid'),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "update", null);
__decorate([
    (0, common_1.Put)(':uuid/role'),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserRoleDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateRole", null);
__decorate([
    (0, common_1.Put)(':uuid/status'),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('uuid')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, dto_1.UpdateUserStatusDto]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':uuid'),
    (0, security_service_1.Roles)(user_entity_1.UserRole.ADMIN, user_entity_1.UserRole.OWNER),
    __param(0, (0, common_1.Param)('uuid')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UserController.prototype, "remove", null);
exports.UserController = UserController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_1.JwtAuthGuard, security_service_1.RolesGuard),
    __metadata("design:paramtypes", [user_service_1.UserService])
], UserController);
//# sourceMappingURL=user.controller.js.map