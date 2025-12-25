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
exports.EmailVerificationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto = require("crypto");
const user_entity_1 = require("../entities/user.entity");
const email_verification_tokens_entity_1 = require("../entities/email-verification-tokens.entity");
const audit_service_1 = require("../audit/audit.service");
let EmailVerificationService = class EmailVerificationService {
    constructor(userRepository, emailVerificationTokensRepository, auditService) {
        this.userRepository = userRepository;
        this.emailVerificationTokensRepository = emailVerificationTokensRepository;
        this.auditService = auditService;
    }
    async generateVerificationToken(dto) {
        const { userId, email } = dto;
        await this.emailVerificationTokensRepository.delete({ userId });
        const verificationToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);
        const emailToken = this.emailVerificationTokensRepository.create({
            userId,
            token: verificationToken,
            expiresAt,
        });
        await this.emailVerificationTokensRepository.save(emailToken);
        console.log(`Email verification link for ${email}: http://localhost:3000/verify-email?token=${verificationToken}`);
        await this.auditService.logEmailVerificationSent(userId, email);
        return verificationToken;
    }
    async verifyEmail(dto) {
        const { token } = dto;
        const verificationToken = await this.emailVerificationTokensRepository.findOne({
            where: { token },
            relations: ['user'],
        });
        if (!verificationToken) {
            throw new common_1.UnauthorizedException('Invalid verification token');
        }
        if (verificationToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Verification token has expired');
        }
        verificationToken.user.emailVerifiedAt = new Date();
        verificationToken.user.status = 1;
        await this.userRepository.save(verificationToken.user);
        await this.emailVerificationTokensRepository.delete(verificationToken.id);
        console.log(`Email verified for user: ${verificationToken.user.email}`);
        await this.auditService.logEmailVerified(verificationToken.userId, verificationToken.user.email);
        return { message: 'Email verified successfully' };
    }
    async resendVerification(dto) {
        const { email } = dto;
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        if (user.emailVerifiedAt) {
            throw new common_1.ConflictException('Email is already verified');
        }
        await this.generateVerificationToken({ userId: user.id, email });
        return { message: 'Verification token sent. Please check console for the token.' };
    }
};
exports.EmailVerificationService = EmailVerificationService;
exports.EmailVerificationService = EmailVerificationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(email_verification_tokens_entity_1.EmailVerificationTokens)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        audit_service_1.AuditService])
], EmailVerificationService);
//# sourceMappingURL=email-verification.service.js.map