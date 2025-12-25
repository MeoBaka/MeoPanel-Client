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
const qrcode = require("qrcode");
const bcrypt = require("bcrypt");
const twofa_auth_entity_1 = require("../entities/twofa-auth.entity");
const twofa_backupcode_entity_1 = require("../entities/twofa-backupcode.entity");
const user_entity_1 = require("../entities/user.entity");
const auth_credentials_entity_1 = require("../entities/auth-credentials.entity");
const audit_service_1 = require("../audit/audit.service");
let TwoFactorService = class TwoFactorService {
    constructor(twofaAuthRepository, twofaBackupCodeRepository, userRepository, authCredentialsRepository, auditService) {
        this.twofaAuthRepository = twofaAuthRepository;
        this.twofaBackupCodeRepository = twofaBackupCodeRepository;
        this.userRepository = userRepository;
        this.authCredentialsRepository = authCredentialsRepository;
        this.auditService = auditService;
    }
    async generateSecret(userId) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const accountName = `MeoPanel: ${user.email} (${user.username})`;
        const secret = speakeasy.generateSecret({
            name: accountName,
            issuer: 'MeoPanel',
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
        const existing = await this.twofaAuthRepository.findOne({
            where: { userId },
        });
        if (existing && existing.isEnabled) {
            throw new common_1.BadRequestException('Two-factor authentication is already enabled');
        }
        const { secret, otpauthUrl } = await this.generateSecret(userId);
        const backupCodes = this.generateBackupCodes();
        await this.twofaBackupCodeRepository.delete({ userId });
        const hashedCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 10)));
        const backupCodeEntities = hashedCodes.map(hash => this.twofaBackupCodeRepository.create({
            userId,
            codeHash: hash,
            isUsed: 0,
        }));
        await this.twofaBackupCodeRepository.save(backupCodeEntities);
        if (existing) {
            existing.secret = secret;
            existing.backupCodes = '';
            existing.isEnabled = 0;
            await this.twofaAuthRepository.save(existing);
        }
        else {
            const twoFactorAuth = this.twofaAuthRepository.create({
                userId,
                secret,
                backupCodes: '',
                isEnabled: 0,
            });
            await this.twofaAuthRepository.save(twoFactorAuth);
        }
        const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);
        await this.auditService.logTwoFASetup(userId);
        return {
            qrCode: qrCodeDataUrl,
        };
    }
    async verifyAndEnableTwoFactor(userId, token) {
        const twoFactorAuth = await this.twofaAuthRepository.findOne({
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
        await this.twofaAuthRepository.save(twoFactorAuth);
        await this.auditService.logTwoFAEnabled(userId);
        const backupCodes = this.generateBackupCodes();
        await this.twofaBackupCodeRepository.delete({ userId });
        const hashedCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 10)));
        const backupCodeEntities = hashedCodes.map(hash => this.twofaBackupCodeRepository.create({
            userId,
            codeHash: hash,
            isUsed: 0,
        }));
        await this.twofaBackupCodeRepository.save(backupCodeEntities);
        return {
            message: 'Two-factor authentication enabled successfully',
            backupCodes,
        };
    }
    async verifyTwoFactorCode(userId, token) {
        const twoFactorAuth = await this.twofaAuthRepository.findOne({
            where: { userId, isEnabled: 1 },
        });
        if (!twoFactorAuth) {
            return false;
        }
        if (this.verifyToken(twoFactorAuth.secret, token)) {
            return true;
        }
        const backupCodes = await this.twofaBackupCodeRepository.find({
            where: { userId, isUsed: 0 },
        });
        for (const backupCode of backupCodes) {
            const isMatch = await bcrypt.compare(token, backupCode.codeHash);
            if (isMatch) {
                backupCode.isUsed = 1;
                await this.twofaBackupCodeRepository.save(backupCode);
                await this.auditService.logTwoFABackupUsed(userId);
                return true;
            }
        }
        return false;
    }
    async disableTwoFactor(userId, verificationToken, currentPassword) {
        const authCredentials = await this.authCredentialsRepository.findOne({ where: { userId } });
        if (!authCredentials) {
            throw new common_1.BadRequestException('User credentials not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, authCredentials.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid current password');
        }
        const twoFactorAuth = await this.twofaAuthRepository.findOne({
            where: { userId },
        });
        if (!twoFactorAuth) {
            throw new common_1.BadRequestException('Two-factor authentication not set up');
        }
        const isValidToken = await this.verifyTwoFactorCode(userId, verificationToken);
        if (!isValidToken) {
            throw new common_1.UnauthorizedException('Invalid verification token');
        }
        twoFactorAuth.isEnabled = 0;
        twoFactorAuth.secret = '';
        twoFactorAuth.backupCodes = '';
        await this.twofaAuthRepository.save(twoFactorAuth);
        await this.twofaBackupCodeRepository.delete({ userId });
        await this.auditService.logTwoFADisabled(userId);
        return { message: 'Two-factor authentication disabled successfully' };
    }
    async regenerateBackupCodes(userId, verificationToken, currentPassword) {
        const authCredentials = await this.authCredentialsRepository.findOne({ where: { userId } });
        if (!authCredentials) {
            throw new common_1.BadRequestException('User credentials not found');
        }
        const isPasswordValid = await bcrypt.compare(currentPassword, authCredentials.passwordHash);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid current password');
        }
        const twoFactorAuth = await this.twofaAuthRepository.findOne({
            where: { userId, isEnabled: 1 },
        });
        if (!twoFactorAuth) {
            throw new common_1.BadRequestException('Two-factor authentication not enabled');
        }
        const isValidToken = await this.verifyTwoFactorCode(userId, verificationToken);
        if (!isValidToken) {
            throw new common_1.UnauthorizedException('Invalid verification token');
        }
        const backupCodes = this.generateBackupCodes();
        await this.twofaBackupCodeRepository.delete({ userId });
        const hashedCodes = await Promise.all(backupCodes.map(code => bcrypt.hash(code, 10)));
        const backupCodeEntities = hashedCodes.map(hash => this.twofaBackupCodeRepository.create({
            userId,
            codeHash: hash,
            isUsed: 0,
        }));
        await this.twofaBackupCodeRepository.save(backupCodeEntities);
        await this.auditService.logTwoFABackupRegenerated(userId);
        return { backupCodes };
    }
    async getTwoFactorStatus(userId) {
        const twoFactorAuth = await this.twofaAuthRepository.findOne({
            where: { userId },
        });
        if (!twoFactorAuth) {
            return { isEnabled: false, isSetup: false };
        }
        const backupCodesCount = await this.twofaBackupCodeRepository.count({
            where: { userId, isUsed: 0 },
        });
        return {
            isEnabled: twoFactorAuth.isEnabled === 1,
            isSetup: true,
            backupCodesCount,
        };
    }
};
exports.TwoFactorService = TwoFactorService;
exports.TwoFactorService = TwoFactorService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(twofa_auth_entity_1.TwofaAuth)),
    __param(1, (0, typeorm_1.InjectRepository)(twofa_backupcode_entity_1.TwofaBackupCode)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(auth_credentials_entity_1.AuthCredentials)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], TwoFactorService);
//# sourceMappingURL=two-factor.service.js.map