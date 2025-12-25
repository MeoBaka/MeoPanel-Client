import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import * as qrcode from 'qrcode';
import * as bcrypt from 'bcrypt';
import { TwofaAuth } from '../entities/twofa-auth.entity';
import { TwofaBackupCode } from '../entities/twofa-backupcode.entity';
import { User } from '../entities/user.entity';
import { AuthCredentials } from '../entities/auth-credentials.entity';
import { AuditService } from '../audit/audit.service';
import {
  SetupTwoFactorDto,
  VerifyAndEnableTwoFactorDto,
  DisableTwoFactorDto,
  RegenerateBackupCodesDto,
  GetTwoFactorStatusDto,
} from '../dto';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(TwofaAuth)
    private twofaAuthRepository: Repository<TwofaAuth>,
    @InjectRepository(TwofaBackupCode)
    private twofaBackupCodeRepository: Repository<TwofaBackupCode>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(AuthCredentials)
    private authCredentialsRepository: Repository<AuthCredentials>,
    private auditService: AuditService,
  ) {}

  async generateSecret(userId: string): Promise<{ secret: string; otpauthUrl: string }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException('User not found');
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

  generateBackupCodes(): string[] {
    const codes = [];
    for (let i = 0; i < 10; i++) {
      codes.push(Math.random().toString(36).substring(2, 10).toUpperCase());
    }
    return codes;
  }

  verifyToken(secret: string, token: string): boolean {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2, // Allow 2 time windows (30 seconds each)
    });
  }

  async setupTwoFactor(dto: SetupTwoFactorDto) {
    const { userId } = dto;
    // Check if 2FA is already set up
    const existing = await this.twofaAuthRepository.findOne({
      where: { userId },
    });

    if (existing && existing.isEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    // Generate new secret and backup codes
    const { secret, otpauthUrl } = await this.generateSecret(userId);
    const backupCodes = this.generateBackupCodes();

    // Delete any existing backup codes for this user
    await this.twofaBackupCodeRepository.delete({ userId });

    // Hash and save backup codes
    const hashedCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    const backupCodeEntities = hashedCodes.map(hash => this.twofaBackupCodeRepository.create({
      userId,
      codeHash: hash,
      isUsed: 0,
    }));
    await this.twofaBackupCodeRepository.save(backupCodeEntities);

    if (existing) {
      // Update existing record
      existing.secret = secret;
      existing.backupCodes = ''; // Clear old JSON backup codes
      existing.isEnabled = 0; // Not enabled until verified
      await this.twofaAuthRepository.save(existing);
    } else {
      // Create new record
      const twoFactorAuth = this.twofaAuthRepository.create({
        userId,
        secret,
        backupCodes: '', // No longer storing JSON
        isEnabled: 0,
      });
      await this.twofaAuthRepository.save(twoFactorAuth);
    }

    // Generate base64 QR code
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    // Audit log 2FA setup
    await this.auditService.logTwoFASetup(userId);

    // Only return QR code for scanning, don't leak secret or backup codes
    return {
      qrCode: qrCodeDataUrl,
    };
  }

  async verifyAndEnableTwoFactor(dto: VerifyAndEnableTwoFactorDto) {
    const { userId, token } = dto;
    const twoFactorAuth = await this.twofaAuthRepository.findOne({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new BadRequestException('Two-factor authentication not set up');
    }

    if (twoFactorAuth.isEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    // Verify the token
    const isValid = this.verifyToken(twoFactorAuth.secret, token);
    if (!isValid) {
      throw new UnauthorizedException('Invalid verification token');
    }

    // Enable 2FA
    twoFactorAuth.isEnabled = 1;
    await this.twofaAuthRepository.save(twoFactorAuth);

    // Audit log 2FA enabled
    await this.auditService.logTwoFAEnabled(userId);

    // Get backup codes from the new table (we need to return the plain codes, but we only have hashes)
    // This is a problem - we need to store plain codes temporarily or regenerate them
    // For now, regenerate and return new codes
    const backupCodes = this.generateBackupCodes();

    // Delete old backup codes and create new ones with plain codes for return
    await this.twofaBackupCodeRepository.delete({ userId });

    const hashedCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

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

  async verifyTwoFactorCode(dto: VerifyAndEnableTwoFactorDto): Promise<boolean> {
    const { userId, token } = dto;
    const twoFactorAuth = await this.twofaAuthRepository.findOne({
      where: { userId, isEnabled: 1 },
    });

    if (!twoFactorAuth) {
      return false; // 2FA not enabled
    }

    // First try TOTP
    if (this.verifyToken(twoFactorAuth.secret, token)) {
      return true;
    }

    // Then try backup codes from the new table
    const backupCodes = await this.twofaBackupCodeRepository.find({
      where: { userId, isUsed: 0 },
    });

    for (const backupCode of backupCodes) {
      const isMatch = await bcrypt.compare(token, backupCode.codeHash);
      if (isMatch) {
        // Mark as used
        backupCode.isUsed = 1;
        await this.twofaBackupCodeRepository.save(backupCode);

        // Audit log backup code used
        await this.auditService.logTwoFABackupUsed(userId);

        return true;
      }
    }

    return false;
  }

  async disableTwoFactor(dto: DisableTwoFactorDto) {
    const { userId, verificationToken, currentPassword } = dto;
    const authCredentials = await this.authCredentialsRepository.findOne({ where: { userId } });
    if (!authCredentials) {
      throw new BadRequestException('User credentials not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, authCredentials.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const twoFactorAuth = await this.twofaAuthRepository.findOne({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new BadRequestException('Two-factor authentication not set up');
    }

    // Verify 2FA token (either TOTP or backup code)
    const isValidToken = await this.verifyTwoFactorCode({ userId, token: verificationToken });
    if (!isValidToken) {
      throw new UnauthorizedException('Invalid verification token');
    }

    // Disable 2FA
    twoFactorAuth.isEnabled = 0;
    twoFactorAuth.secret = '';
    twoFactorAuth.backupCodes = '';
    await this.twofaAuthRepository.save(twoFactorAuth);

    // Delete all backup codes from the new table
    await this.twofaBackupCodeRepository.delete({ userId });

    // Audit log 2FA disabled
    await this.auditService.logTwoFADisabled(userId);

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async regenerateBackupCodes(dto: RegenerateBackupCodesDto) {
    const { userId, verificationToken, currentPassword } = dto;
    const authCredentials = await this.authCredentialsRepository.findOne({ where: { userId } });
    if (!authCredentials) {
      throw new BadRequestException('User credentials not found');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, authCredentials.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid current password');
    }

    const twoFactorAuth = await this.twofaAuthRepository.findOne({
      where: { userId, isEnabled: 1 },
    });

    if (!twoFactorAuth) {
      throw new BadRequestException('Two-factor authentication not enabled');
    }

    // Verify 2FA token (either TOTP or backup code)
    const isValidToken = await this.verifyTwoFactorCode({ userId, token: verificationToken });
    if (!isValidToken) {
      throw new UnauthorizedException('Invalid verification token');
    }

    const backupCodes = this.generateBackupCodes();

    // Delete existing backup codes
    await this.twofaBackupCodeRepository.delete({ userId });

    // Hash and save new backup codes
    const hashedCodes = await Promise.all(
      backupCodes.map(code => bcrypt.hash(code, 10))
    );

    const backupCodeEntities = hashedCodes.map(hash => this.twofaBackupCodeRepository.create({
      userId,
      codeHash: hash,
      isUsed: 0,
    }));
    await this.twofaBackupCodeRepository.save(backupCodeEntities);

    // Audit log backup codes regenerated
    await this.auditService.logTwoFABackupRegenerated(userId);

    return { backupCodes };
  }

  async getTwoFactorStatus(dto: GetTwoFactorStatusDto) {
    const { userId } = dto;
    const twoFactorAuth = await this.twofaAuthRepository.findOne({
      where: { userId },
    });

    if (!twoFactorAuth) {
      return { isEnabled: false, isSetup: false };
    }

    // Count unused backup codes from the new table
    const backupCodesCount = await this.twofaBackupCodeRepository.count({
      where: { userId, isUsed: 0 },
    });

    return {
      isEnabled: twoFactorAuth.isEnabled === 1,
      isSetup: true,
      backupCodesCount,
    };
  }
}