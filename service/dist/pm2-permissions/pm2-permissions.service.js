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
exports.PM2PermissionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const pm2_permissions_entity_1 = require("../entities/pm2-permissions.entity");
let PM2PermissionsService = class PM2PermissionsService {
    constructor(pm2PermissionsRepository) {
        this.pm2PermissionsRepository = pm2PermissionsRepository;
    }
    async create(createDto) {
        const permission = this.pm2PermissionsRepository.create(createDto);
        return this.pm2PermissionsRepository.save(permission);
    }
    async findAll() {
        return this.pm2PermissionsRepository.find({
            relations: ['user', 'wserver'],
        });
    }
    async findByUser(userId) {
        return this.pm2PermissionsRepository.find({
            where: { userId },
            relations: ['user', 'wserver'],
        });
    }
    async findByUserAndServer(userId, wserverId) {
        return this.pm2PermissionsRepository.find({
            where: { userId, wserverId },
            relations: ['user', 'wserver'],
        });
    }
    async findOne(id) {
        const permission = await this.pm2PermissionsRepository.findOne({
            where: { id },
            relations: ['user', 'wserver'],
        });
        if (!permission) {
            throw new common_1.NotFoundException(`PM2 permission with ID ${id} not found`);
        }
        return permission;
    }
    async update(id, updateDto) {
        const permission = await this.findOne(id);
        Object.assign(permission, updateDto);
        return this.pm2PermissionsRepository.save(permission);
    }
    async remove(id) {
        const permission = await this.findOne(id);
        await this.pm2PermissionsRepository.remove(permission);
    }
    async findByUserServerProcess(userId, wserverId, pm2ProcessName) {
        return this.pm2PermissionsRepository.findOne({
            where: { userId, wserverId, pm2ProcessName },
            relations: ['user', 'wserver'],
        });
    }
    async upsert(createDto) {
        const existing = await this.findByUserServerProcess(createDto.userId, createDto.wserverId, createDto.pm2ProcessName);
        if (existing) {
            return this.update(existing.id, { permissions: createDto.permissions });
        }
        return this.create(createDto);
    }
};
exports.PM2PermissionsService = PM2PermissionsService;
exports.PM2PermissionsService = PM2PermissionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(pm2_permissions_entity_1.PM2Permissions)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PM2PermissionsService);
//# sourceMappingURL=pm2-permissions.service.js.map