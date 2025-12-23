import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';
import { AuthCredentials } from '../entities/auth-credentials.entity';
import { AuthSessions } from '../entities/auth-sessions.entity';
import { AuthLoginLogs } from '../entities/auth-login-logs.entity';
import { PasswordResetTokens } from '../entities/password-reset-tokens.entity';
import { JwtService } from '../jwt';
import { EmailVerificationService } from '../email-verification/email-verification.service';
import { TwoFactorService } from '../twofa/two-factor.service';
import { AuditService } from '../audit/audit.service';
import { SecurityService } from './security.service';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuthCredentials)
    private authCredentialsRepository: Repository<AuthCredentials>,
    @InjectRepository(AuthSessions)
    private authSessionsRepository: Repository<AuthSessions>,
    @InjectRepository(AuthLoginLogs)
    private authLoginLogsRepository: Repository<AuthLoginLogs>,
    @InjectRepository(PasswordResetTokens)
    private passwordResetTokensRepository: Repository<PasswordResetTokens>,
    private emailVerificationService: EmailVerificationService,
    private twoFactorService: TwoFactorService,
    private auditService: AuditService,
    private securityService: SecurityService,
  ) {}

  async register(registerDto: { username: string; email: string; password: string; name?: string }) {
    // Sanitize and validate input
    const sanitizedInput = this.securityService.validateAndSanitizeUserInput(registerDto);
    const { username, email, password, name } = sanitizedInput;

    // Validate email format
    if (!this.securityService.validateEmail(email)) {
      throw new BadRequestException('Invalid email format');
    }

    // Validate password strength
    const passwordValidation = this.securityService.validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Check if user exists
    const existingUser = await this.userRepository.findOne({ where: [{ username }, { email }] });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Create user
    const user = this.userRepository.create({ name, username, email });
    await this.userRepository.save(user);

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create auth credentials
    const authCredentials = this.authCredentialsRepository.create({
      userId: user.id,
      username,
      email,
      passwordHash,
    });
    await this.authCredentialsRepository.save(authCredentials);

    // Generate email verification token
    await this.emailVerificationService.generateVerificationToken(user.id, email);

    // Audit log user registration
    await this.auditService.logUserRegistration(user.id, email);

    return { message: 'User registered successfully. Please check console for verification token.' };
  }

  async login(loginDto: { usernameOrEmail: string; password: string; twoFactorCode?: string }, ipAddress: string, userAgent: string) {
    // Sanitize input
    const sanitizedInput = this.securityService.validateAndSanitizeUserInput(loginDto);
    const { usernameOrEmail, password, twoFactorCode } = sanitizedInput;

    // Find credentials
    const credentials = await this.authCredentialsRepository.findOne({
      where: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
      relations: ['user'],
    });
    if (!credentials) {
      // Audit log failed login attempt
      await this.auditService.logFailedLogin(usernameOrEmail, 'User not found', ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, credentials.passwordHash);
    if (!isPasswordValid) {
      // Audit log failed login attempt
      await this.auditService.logFailedLogin(usernameOrEmail, 'Invalid password', ipAddress, userAgent);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if 2FA is enabled
    const twoFactorStatus = await this.twoFactorService.getTwoFactorStatus(credentials.userId);

    if (twoFactorStatus.isEnabled) {
      // 2FA is enabled, require 2FA code
      if (!twoFactorCode) {
        return {
          requiresTwoFactor: true,
          userId: credentials.userId,
          message: 'Two-factor authentication required',
        };
      }

      // Verify 2FA code
      const isTwoFactorValid = await this.twoFactorService.verifyTwoFactorCode(credentials.userId, twoFactorCode);
      if (!isTwoFactorValid) {
        throw new UnauthorizedException('Invalid two-factor code');
      }
    }

    // Generate tokens
    const payload = { sub: credentials.userId, username: credentials.username };
    const accessToken = this.jwtService.generateAccessToken(payload);
    const refreshToken = this.jwtService.generateRefreshToken(payload);

    // Create session
    const refreshExpiresAt = new Date();
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    const session = this.authSessionsRepository.create({
      userId: credentials.userId,
      refreshToken,
      refreshExpiresAt,
      ipAddress,
      userAgent,
    });
    await this.authSessionsRepository.save(session);

    // Log login
    const loginLog = this.authLoginLogsRepository.create({
      userId: credentials.userId,
      sessionId: session.id,
      ipAddress,
      userAgent,
    });
    await this.authLoginLogsRepository.save(loginLog);

    // Audit log successful login
    await this.auditService.logUserLogin(credentials.userId, credentials.email, ipAddress, userAgent, session.id.toString());

    return {
      accessToken,
      refreshToken,
      user: credentials.user,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verifyToken(refreshToken);
      const session = await this.authSessionsRepository.findOne({
        where: { refreshToken, userId: payload.sub },
      });
      if (!session || session.refreshExpiresAt < new Date()) {
        throw new UnauthorizedException();
      }

      const newPayload = { sub: payload.sub, username: payload.username };
      const newAccessToken = this.jwtService.generateAccessToken(newPayload);
      const newRefreshToken = this.jwtService.generateRefreshToken(newPayload);

      // Update session
      session.refreshToken = newRefreshToken;
      session.lastUsedAt = new Date();
      await this.authSessionsRepository.save(session);

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new UnauthorizedException();
    }
  }

  async forgotPassword(email: string) {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: 'If the email exists, a password reset link has been sent.' };
    }

    // Delete any existing reset tokens for this user
    await this.passwordResetTokensRepository.delete({ userId: user.id });

    // Generate reset token
    const resetToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    const resetTokenEntity = this.passwordResetTokensRepository.create({
      userId: user.id,
      token: resetToken,
      expiresAt,
    });
    await this.passwordResetTokensRepository.save(resetTokenEntity);

    // Log reset token (since email sending is not implemented)
    console.log(`Password reset token for ${email}: ${resetToken}`);

    // Audit log password reset request
    await this.auditService.logPasswordResetRequest(email);

    return { message: 'If the email exists, a password reset link has been sent.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.passwordResetTokensRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!resetToken) {
      throw new UnauthorizedException('Invalid reset token');
    }

    if (resetToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Reset token has expired');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password in auth_credentials
    const credentials = await this.authCredentialsRepository.findOne({
      where: { userId: resetToken.userId },
    });

    if (!credentials) {
      throw new UnauthorizedException('User credentials not found');
    }

    credentials.passwordHash = newPasswordHash;
    await this.authCredentialsRepository.save(credentials);

    // Delete the reset token
    await this.passwordResetTokensRepository.delete(resetToken.id);

    console.log(`Password reset successful for user: ${resetToken.user.email}`);

    // Audit log password reset
    await this.auditService.logPasswordReset(resetToken.userId);

    return { message: 'Password has been reset successfully' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, ipAddress?: string, userAgent?: string) {
    // Find user credentials
    const credentials = await this.authCredentialsRepository.findOne({
      where: { userId },
      relations: ['user'],
    });

    if (!credentials) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, credentials.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    credentials.passwordHash = newPasswordHash;
    await this.authCredentialsRepository.save(credentials);

    // Invalidate all sessions (optional security measure)
    await this.authSessionsRepository.update(
      { userId },
      { status: 0 } // Mark as inactive
    );

    console.log(`Password changed for user: ${credentials.user.email}`);

    // Audit log password change
    await this.auditService.logPasswordChange(userId, ipAddress, userAgent);

    return { message: 'Password changed successfully. Please login again.' };
  }

  async logout(refreshToken: string, ipAddress?: string, userAgent?: string) {
    try {
      // Verify the refresh token to get user info
      const payload = this.jwtService.verifyToken(refreshToken);

      // Find and invalidate the specific session
      const session = await this.authSessionsRepository.findOne({
        where: { refreshToken, userId: payload.sub },
      });

      if (session) {
        session.status = 0; // Mark as inactive
        await this.authSessionsRepository.save(session);
      }

      // Audit log user logout
      await this.auditService.logUserLogout(payload.sub, session?.id.toString(), ipAddress);

      return { message: 'Logged out successfully' };
    } catch {
      // Even if token is invalid, return success for security
      return { message: 'Logged out successfully' };
    }
  }

  async logoutAll(userId: string) {
    // Invalidate all sessions for the user
    await this.authSessionsRepository.update(
      { userId },
      { status: 0 } // Mark as inactive
    );

    return { message: 'Logged out from all devices successfully' };
  }

  async getAllUsers() {
    // Get all users but exclude sensitive information
    const users = await this.userRepository.find({
      select: ['id', 'name', 'username', 'email', 'role', 'emailVerifiedAt', 'created_at', 'updated_at'],
    });

    return users;
  }

}