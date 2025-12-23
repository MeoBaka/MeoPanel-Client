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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = require("bcrypt");
const user_entity_1 = require("../entities/user.entity");
const auth_credentials_entity_1 = require("../entities/auth-credentials.entity");
const auth_sessions_entity_1 = require("../entities/auth-sessions.entity");
const auth_login_logs_entity_1 = require("../entities/auth-login-logs.entity");
const password_reset_tokens_entity_1 = require("../entities/password-reset-tokens.entity");
const jwt_1 = require("../jwt");
const email_verification_service_1 = require("../email-verification/email-verification.service");
const two_factor_service_1 = require("../twofa/two-factor.service");
const audit_service_1 = require("../audit/audit.service");
const security_service_1 = require("./security.service");
const crypto = require("crypto");
let AuthService = class AuthService {
    constructor(jwtService, userRepository, authCredentialsRepository, authSessionsRepository, authLoginLogsRepository, passwordResetTokensRepository, emailVerificationService, twoFactorService, auditService, securityService) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.authCredentialsRepository = authCredentialsRepository;
        this.authSessionsRepository = authSessionsRepository;
        this.authLoginLogsRepository = authLoginLogsRepository;
        this.passwordResetTokensRepository = passwordResetTokensRepository;
        this.emailVerificationService = emailVerificationService;
        this.twoFactorService = twoFactorService;
        this.auditService = auditService;
        this.securityService = securityService;
    }
    async register(registerDto) {
        const sanitizedInput = this.securityService.validateAndSanitizeUserInput(registerDto);
        const { username, email, password, name } = sanitizedInput;
        if (!this.securityService.validateEmail(email)) {
            throw new common_1.BadRequestException('Invalid email format');
        }
        const passwordValidation = this.securityService.validatePassword(password);
        if (!passwordValidation.isValid) {
            throw new common_1.BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
        }
        const existingUser = await this.userRepository.findOne({ where: [{ username }, { email }] });
        if (existingUser) {
            throw new common_1.ConflictException('User already exists');
        }
        const user = this.userRepository.create({ name, username, email });
        await this.userRepository.save(user);
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);
        const authCredentials = this.authCredentialsRepository.create({
            userId: user.id,
            username,
            email,
            passwordHash,
        });
        await this.authCredentialsRepository.save(authCredentials);
        await this.emailVerificationService.generateVerificationToken(user.id, email);
        await this.auditService.logUserRegistration(user.id, email);
        return { message: 'User registered successfully. Please check console for verification token.' };
    }
    async login(loginDto, ipAddress, userAgent) {
        const sanitizedInput = this.securityService.validateAndSanitizeUserInput(loginDto);
        const { usernameOrEmail, password, twoFactorCode } = sanitizedInput;
        const credentials = await this.authCredentialsRepository.findOne({
            where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
        });
        if (!credentials) {
            await this.auditService.logFailedLogin(usernameOrEmail, 'User not found', ipAddress, userAgent);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const user = await this.userRepository.findOne({ where: { username: credentials.username } });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(password, credentials.passwordHash);
        if (!isPasswordValid) {
            await this.auditService.logFailedLogin(usernameOrEmail, 'Invalid password', ipAddress, userAgent);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const twoFactorStatus = await this.twoFactorService.getTwoFactorStatus(user.id);
        if (twoFactorStatus.isEnabled) {
            if (!twoFactorCode) {
                return {
                    requiresTwoFactor: true,
                    userId: user.id,
                    message: 'Two-factor authentication required',
                };
            }
            const isTwoFactorValid = await this.twoFactorService.verifyTwoFactorCode(user.id, twoFactorCode);
            if (!isTwoFactorValid) {
                throw new common_1.UnauthorizedException('Invalid two-factor code');
            }
        }
        const payload = { sub: credentials.username, username: credentials.username };
        const accessToken = this.jwtService.generateAccessToken(payload);
        const refreshToken = this.jwtService.generateRefreshToken(payload);
        const refreshExpiresAt = new Date();
        refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);
        const session = this.authSessionsRepository.create({
            userId: user.id,
            refreshToken,
            refreshExpiresAt,
            ipAddress,
            userAgent,
        });
        await this.authSessionsRepository.save(session);
        const loginLog = this.authLoginLogsRepository.create({
            userId: user.id,
            sessionId: session.id,
            ipAddress,
            userAgent,
        });
        await this.authLoginLogsRepository.save(loginLog);
        await this.auditService.logUserLogin(user.id, credentials.email, ipAddress, userAgent, session.id.toString());
        return {
            accessToken,
            refreshToken,
            user,
        };
    }
    async refreshToken(refreshToken) {
        try {
            const payload = this.jwtService.verifyToken(refreshToken);
            let user;
            if (payload.sub.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                user = await this.userRepository.findOne({ where: { id: payload.sub } });
            }
            else {
                user = await this.userRepository.findOne({ where: { username: payload.sub } });
            }
            if (!user) {
                throw new common_1.UnauthorizedException();
            }
            const session = await this.authSessionsRepository.findOne({
                where: { refreshToken, userId: user.id },
            });
            if (!session || session.refreshExpiresAt < new Date()) {
                throw new common_1.UnauthorizedException();
            }
            const newPayload = { sub: user.username, username: user.username };
            const newAccessToken = this.jwtService.generateAccessToken(newPayload);
            const newRefreshToken = this.jwtService.generateRefreshToken(newPayload);
            session.refreshToken = newRefreshToken;
            session.lastUsedAt = new Date();
            await this.authSessionsRepository.save(session);
            return { accessToken: newAccessToken, refreshToken: newRefreshToken };
        }
        catch {
            throw new common_1.UnauthorizedException();
        }
    }
    async forgotPassword(email) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            return { message: 'If the email exists, a password reset link has been sent.' };
        }
        await this.passwordResetTokensRepository.delete({ userId: user.id });
        const resetToken = crypto.randomBytes(64).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1);
        const resetTokenEntity = this.passwordResetTokensRepository.create({
            userId: user.id,
            token: resetToken,
            expiresAt,
        });
        await this.passwordResetTokensRepository.save(resetTokenEntity);
        console.log(`Password reset token for ${email}: ${resetToken}`);
        await this.auditService.logPasswordResetRequest(email);
        return { message: 'If the email exists, a password reset link has been sent.' };
    }
    async resetPassword(token, newPassword) {
        const resetToken = await this.passwordResetTokensRepository.findOne({
            where: { token },
            relations: ['user'],
        });
        if (!resetToken) {
            throw new common_1.UnauthorizedException('Invalid reset token');
        }
        if (resetToken.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Reset token has expired');
        }
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        const credentials = await this.authCredentialsRepository.findOne({
            where: { userId: resetToken.userId },
        });
        if (!credentials) {
            throw new common_1.UnauthorizedException('User credentials not found');
        }
        credentials.passwordHash = newPasswordHash;
        await this.authCredentialsRepository.save(credentials);
        await this.passwordResetTokensRepository.delete(resetToken.id);
        console.log(`Password reset successful for user: ${resetToken.user.email}`);
        await this.auditService.logPasswordReset(resetToken.userId);
        return { message: 'Password has been reset successfully' };
    }
    async changePassword(userId, currentPassword, newPassword, ipAddress, userAgent) {
        const credentials = await this.authCredentialsRepository.findOne({
            where: { userId },
            relations: ['user'],
        });
        if (!credentials) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, credentials.passwordHash);
        if (!isCurrentPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const saltRounds = 10;
        const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);
        credentials.passwordHash = newPasswordHash;
        await this.authCredentialsRepository.save(credentials);
        await this.authSessionsRepository.update({ userId }, { status: 0 });
        console.log(`Password changed for user: ${credentials.user.email}`);
        await this.auditService.logPasswordChange(userId, ipAddress, userAgent);
        return { message: 'Password changed successfully. Please login again.' };
    }
    async logout(refreshToken, ipAddress, userAgent) {
        try {
            const payload = this.jwtService.verifyToken(refreshToken);
            let user;
            if (payload.sub.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
                user = await this.userRepository.findOne({ where: { id: payload.sub } });
            }
            else {
                user = await this.userRepository.findOne({ where: { username: payload.sub } });
            }
            const session = await this.authSessionsRepository.findOne({
                where: { refreshToken, userId: user?.id },
            });
            if (session) {
                session.status = 0;
                await this.authSessionsRepository.save(session);
            }
            if (user) {
                await this.auditService.logUserLogout(user.id, session?.id.toString(), ipAddress);
            }
            return { message: 'Logged out successfully' };
        }
        catch {
            return { message: 'Logged out successfully' };
        }
    }
    async logoutAll(userId) {
        await this.authSessionsRepository.update({ userId }, { status: 0 });
        return { message: 'Logged out from all devices successfully' };
    }
    async getAllUsers() {
        const users = await this.userRepository.find({
            select: ['id', 'name', 'username', 'email', 'role', 'emailVerifiedAt', 'created_at', 'updated_at'],
        });
        return users;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(auth_credentials_entity_1.AuthCredentials)),
    __param(3, (0, typeorm_1.InjectRepository)(auth_sessions_entity_1.AuthSessions)),
    __param(4, (0, typeorm_1.InjectRepository)(auth_login_logs_entity_1.AuthLoginLogs)),
    __param(5, (0, typeorm_1.InjectRepository)(password_reset_tokens_entity_1.PasswordResetTokens)),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        email_verification_service_1.EmailVerificationService,
        two_factor_service_1.TwoFactorService,
        audit_service_1.AuditService,
        security_service_1.SecurityService])
], AuthService);
//# sourceMappingURL=auth.service.js.map