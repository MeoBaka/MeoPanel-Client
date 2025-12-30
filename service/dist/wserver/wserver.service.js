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
exports.WserverService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wserver_entity_1 = require("../entities/wserver.entity");
let WserverService = class WserverService {
    constructor(wserverRepository) {
        this.wserverRepository = wserverRepository;
    }
    async create(wserverData) {
        const wserver = this.wserverRepository.create(wserverData);
        return this.wserverRepository.save(wserver);
    }
    async findAll() {
        return this.wserverRepository.find();
    }
    async findOne(id) {
        const wserver = await this.wserverRepository.findOne({ where: { id } });
        if (!wserver) {
            throw new common_1.NotFoundException(`Wserver with ID ${id} not found`);
        }
        return wserver;
    }
    async update(id, wserverData) {
        await this.wserverRepository.update(id, wserverData);
        return this.findOne(id);
    }
    async remove(id) {
        const result = await this.wserverRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`Wserver with ID ${id} not found`);
        }
    }
    async getServerStatus(id) {
        const wserver = await this.findOne(id);
        throw new Error('WebSocket connection not implemented yet');
    }
};
exports.WserverService = WserverService;
exports.WserverService = WserverService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wserver_entity_1.Wserver)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], WserverService);
//# sourceMappingURL=wserver.service.js.map