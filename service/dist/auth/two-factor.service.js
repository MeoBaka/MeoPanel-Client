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
exports.TwoFactorService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const speakeasy = require("speakeasy");
const two_factor_auth_entity_1 = require("../entities/two-factor-auth.entity");
let TwoFactorService = class TwoFactorService {
    constructor(twoFactorAuthRepository) {
        this.twoFactorAuthRepository = twoFactorAuthRepository;
    }
    generateSecret() {
        const secret = speakeasy.generateSecret({
            name: 'MeoPanel',
            issuer: 'MeoPanel Auth',
        });
        return {
            secret: secret.base32,
            otpauthUrl: secret.otpauth_url,
        };
    }
    generateBackupCodes() {
        const codes = [];
        for (let i = 0; i < 10; i++) {
            codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
        }
        return codes;
    }
    verifyToken(secret, token) {
        return speakeasy.totp.verify({
            secret: secret,
            encoding: 'base32',
            token: token,
            window: 2,
        });
    }
    async setupTwoFactor(userId) {
        const existing = await this.twoFactorAuthRepository.findOne({
            where: { userId },
        });
        if (existing && existing.isEnabled) {
            throw new common_1.BadRequestException('Two-factor authentication is already enabled');
        }
        const { secret, otpauthUrl } = this.generateSecret();
        const backupCodes = this.generateBackupCodes();
        if (existing) {
            existing.secret = secret;
            existing.backupCodes = JSON.stringify(backupCodes);
            existing.isEnabled = 0;
            await this.twoFactorAuthRepository.save(existing);
        }
        else {
            const twoFactorAuth = this.twoFactorAuthRepository.create({
                userId,
                secret,
                backupCodes: JSON.stringify(backupCodes),
                isEnabled: 0,
            });
            await this.twoFactorAuthRepository.save(twoFactorAuth);
        }
        return {
            secret,
            otpauthUrl,
            backupCodes,
        };
    }
    async verifyAndEnableTwoFactor(userId, token) {
        const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
            where: { userId },
        });
        if (!twoFactorAuth) {
            throw new common_1.BadRequestException('Two-factor authentication not set up');
        }
        if (twoFactorAuth.isEnabled) {
            throw new common_1.BadRequestException('Two-factor authentication is already enabled');
        }
        const isValid = this.verifyToken(twoFactorAuth.secret, token);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Invalid verification token');
        }
        twoFactorAuth.isEnabled = 1;
        await this.twoFactorAuthRepository.save(twoFactorAuth);
        return { message: 'Two-factor authentication enabled successfully' };
    }
    async verifyTwoFactorCode(userId, token) {
        const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
            where: { userId, isEnabled: 1 },
        });
        if (!twoFactorAuth) {
            return false;
        }
        if (this.verifyToken(twoFactorAuth.secret, token)) {
            return true;
        }
        const backupCodes = JSON.parse(twoFactorAuth.backupCodes || '[]');
        const codeIndex = backupCodes.indexOf(token);
        if (codeIndex !== -1) {
            backupCodes.splice(codeIndex, 1);
            twoFactorAuth.backupCodes = JSON.stringify(backupCodes);
            await this.twoFactorAuthRepository.save(twoFactorAuth);
            return true;
        }
        return false;
    }
    async disableTwoFactor(userId) {
        const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
            where: { userId },
        });
        if (!twoFactorAuth) {
            throw new common_1.BadRequestException('Two-factor authentication not set up');
        }
        twoFactorAuth.isEnabled = 0;
        twoFactorAuth.secret = '';
        twoFactorAuth.backupCodes = '';
        await this.twoFactorAuthRepository.save(twoFactorAuth);
        return { message: 'Two-factor authentication disabled successfully' };
    }
    async regenerateBackupCodes(userId) {
        const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
            where: { userId, isEnabled: 1 },
        });
        if (!twoFactorAuth) {
            throw new common_1.BadRequestException('Two-factor authentication not enabled');
        }
        const backupCodes = this.generateBackupCodes();
        twoFactorAuth.backupCodes = JSON.stringify(backupCodes);
        await this.twoFactorAuthRepository.save(twoFactorAuth);
        return { backupCodes };
    }
    async getTwoFactorStatus(userId) {
        const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
            where: { userId },
        });
        if (!twoFactorAuth) {
            return { isEnabled: false, isSetup: false };
        }
        return {
            isEnabled: twoFactorAuth.isEnabled === 1,
            isSetup: true,
            backupCodesCount: JSON.parse(twoFactorAuth.backupCodes || '[]').length,
        };
    }
};
exports.TwoFactorService = TwoFactorService;
exports.TwoFactorService = TwoFactorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(two_factor_auth_entity_1.TwoFactorAuth)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TwoFactorService);
//# sourceMappingURL=two-factor.service.js.map