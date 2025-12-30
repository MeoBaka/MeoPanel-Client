"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WserverModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const wserver_entity_1 = require("../entities/wserver.entity");
const pm2_permissions_entity_1 = require("../entities/pm2-permissions.entity");
const wserver_service_1 = require("./wserver.service");
const wserver_controller_1 = require("./wserver.controller");
let WserverModule = class WserverModule {
};
exports.WserverModule = WserverModule;
exports.WserverModule = WserverModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([wserver_entity_1.Wserver, pm2_permissions_entity_1.PM2Permissions])],
        controllers: [wserver_controller_1.WserverController],
        providers: [wserver_service_1.WserverService],
        exports: [wserver_service_1.WserverService],
    })
], WserverModule);
//# sourceMappingURL=wserver.module.js.map