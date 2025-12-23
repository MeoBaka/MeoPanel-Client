"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TwoFactorModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const two_factor_service_1 = require("./two-factor.service");
const two_factor_auth_entity_1 = require("../entities/two-factor-auth.entity");
const audit_module_1 = require("../audit/audit.module");
let TwoFactorModule = class TwoFactorModule {
};
exports.TwoFactorModule = TwoFactorModule;
exports.TwoFactorModule = TwoFactorModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([two_factor_auth_entity_1.TwoFactorAuth]),
            audit_module_1.AuditModule,
        ],
        providers: [two_factor_service_1.TwoFactorService],
        exports: [two_factor_service_1.TwoFactorService],
    })
], TwoFactorModule);
//# sourceMappingURL=two-factor.module.js.map