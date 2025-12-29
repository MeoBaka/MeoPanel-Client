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
exports.Pm2Note = void 0;
const typeorm_1 = require("typeorm");
const wserver_entity_1 = require("./wserver.entity");
let Pm2Note = class Pm2Note {
};
exports.Pm2Note = Pm2Note;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Pm2Note.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], Pm2Note.prototype, "server_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wserver_entity_1.Wserver),
    (0, typeorm_1.JoinColumn)({ name: 'server_id' }),
    __metadata("design:type", wserver_entity_1.Wserver)
], Pm2Note.prototype, "server", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], Pm2Note.prototype, "process_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Pm2Note.prototype, "note", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Pm2Note.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], Pm2Note.prototype, "updated_at", void 0);
exports.Pm2Note = Pm2Note = __decorate([
    (0, typeorm_1.Entity)('pm2_notes')
], Pm2Note);
//# sourceMappingURL=pm2-note.entity.js.map