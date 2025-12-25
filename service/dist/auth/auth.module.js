"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const auth_service_1 = require("./auth.service");
const auth_controller_1 = require("./auth.controller");
const user_entity_1 = require("../entities/user.entity");
const auth_credentials_entity_1 = require("../entities/auth-credentials.entity");
const auth_sessions_entity_1 = require("../entities/auth-sessions.entity");
const auth_login_logs_entity_1 = require("../entities/auth-login-logs.entity");
const password_reset_tokens_entity_1 = require("../entities/password-reset-tokens.entity");
const twofa_auth_entity_1 = require("../entities/twofa-auth.entity");
const jwt_1 = require("../jwt");
const email_verification_1 = require("../email-verification");
const audit_module_1 = require("../audit/audit.module");
const two_factor_module_1 = require("../twofa/two-factor.module");
const security_service_1 = require("./security.service");
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([user_entity_1.User, auth_credentials_entity_1.AuthCredentials, auth_sessions_entity_1.AuthSessions, auth_login_logs_entity_1.AuthLoginLogs, password_reset_tokens_entity_1.PasswordResetTokens, twofa_auth_entity_1.TwofaAuth]),
            jwt_1.JwtModule,
            email_verification_1.EmailVerificationModule,
            audit_module_1.AuditModule,
            two_factor_module_1.TwoFactorModule,
        ],
        providers: [auth_service_1.AuthService, security_service_1.SecurityService, security_service_1.RolesGuard],
        controllers: [auth_controller_1.AuthController],
        exports: [auth_service_1.AuthService],
    })
], AuthModule);
//# sourceMappingURL=auth.module.js.map