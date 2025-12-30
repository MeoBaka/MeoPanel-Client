"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PM2PermissionsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const pm2_permissions_entity_1 = require("../entities/pm2-permissions.entity");
const pm2_permissions_service_1 = require("./pm2-permissions.service");
const pm2_permissions_controller_1 = require("./pm2-permissions.controller");
let PM2PermissionsModule = class PM2PermissionsModule {
};
exports.PM2PermissionsModule = PM2PermissionsModule;
exports.PM2PermissionsModule = PM2PermissionsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([pm2_permissions_entity_1.PM2Permissions])],
        providers: [pm2_permissions_service_1.PM2PermissionsService],
        controllers: [pm2_permissions_controller_1.PM2PermissionsController],
        exports: [pm2_permissions_service_1.PM2PermissionsService],
    })
], PM2PermissionsModule);
//# sourceMappingURL=pm2-permissions.module.js.map