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
exports.TwofaAuth = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
let TwofaAuth = class TwofaAuth {
};
exports.TwofaAuth = TwofaAuth;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'id' }),
    __metadata("design:type", String)
], TwofaAuth.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    __metadata("design:type", String)
], TwofaAuth.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], TwofaAuth.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'secret' }),
    __metadata("design:type", String)
], TwofaAuth.prototype, "secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'tinyint', default: 0, name: 'is_enabled' }),
    __metadata("design:type", Number)
], TwofaAuth.prototype, "isEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true, name: 'backup_codes' }),
    __metadata("design:type", String)
], TwofaAuth.prototype, "backupCodes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', name: 'created_at' }),
    __metadata("design:type", Date)
], TwofaAuth.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', name: 'updated_at' }),
    __metadata("design:type", Date)
], TwofaAuth.prototype, "updatedAt", void 0);
exports.TwofaAuth = TwofaAuth = __decorate([
    (0, typeorm_1.Entity)('twofa_auth')
], TwofaAuth);
//# sourceMappingURL=twofa-auth.entity.js.map