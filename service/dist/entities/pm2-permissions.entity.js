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
exports.PM2Permissions = exports.PM2Permission = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const wserver_entity_1 = require("./wserver.entity");
var PM2Permission;
(function (PM2Permission) {
    PM2Permission["VIEW"] = "view";
    PM2Permission["CONTROL"] = "control";
    PM2Permission["EDIT_NOTE"] = "edit_note";
    PM2Permission["CONTROL_FILE"] = "control_file";
    PM2Permission["SAVE_RESURRECT"] = "save_resurrect";
})(PM2Permission || (exports.PM2Permission = PM2Permission = {}));
let PM2Permissions = class PM2Permissions {
};
exports.PM2Permissions = PM2Permissions;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid', { name: 'uuid' }),
    __metadata("design:type", String)
], PM2Permissions.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'user_id' }),
    __metadata("design:type", String)
], PM2Permissions.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], PM2Permissions.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', name: 'wserver_id' }),
    __metadata("design:type", String)
], PM2Permissions.prototype, "wserverId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => wserver_entity_1.Wserver),
    (0, typeorm_1.JoinColumn)({ name: 'wserver_id' }),
    __metadata("design:type", wserver_entity_1.Wserver)
], PM2Permissions.prototype, "wserver", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, name: 'pm2_process_name' }),
    __metadata("design:type", String)
], PM2Permissions.prototype, "pm2ProcessName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', name: 'permissions' }),
    __metadata("design:type", Array)
], PM2Permissions.prototype, "permissions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PM2Permissions.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PM2Permissions.prototype, "updated_at", void 0);
exports.PM2Permissions = PM2Permissions = __decorate([
    (0, typeorm_1.Entity)('pm2_permissions')
], PM2Permissions);
//# sourceMappingURL=pm2-permissions.entity.js.map