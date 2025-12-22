import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as speakeasy from 'speakeasy';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';

@Injectable()
export class TwoFactorService {
  constructor(
    @InjectRepository(TwoFactorAuth)
    private twoFactorAuthRepository: Repository<TwoFactorAuth>,
  ) {}

  generateSecret(): { secret: string; otpauthUrl: string } {
    const secret = speakeasy.generateSecret({
      name: 'MeoPanel',
      issuer: 'MeoPanel Auth',
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

  async setupTwoFactor(userId: string) {
    // Check if 2FA is already set up
    const existing = await this.twoFactorAuthRepository.findOne({
      where: { userId },
    });

    if (existing && existing.isEnabled) {
      throw new BadRequestException('Two-factor authentication is already enabled');
    }

    // Generate new secret and backup codes
    const { secret, otpauthUrl } = this.generateSecret();
    const backupCodes = this.generateBackupCodes();

    if (existing) {
      // Update existing record
      existing.secret = secret;
      existing.backupCodes = JSON.stringify(backupCodes);
      existing.isEnabled = 0; // Not enabled until verified
      await this.twoFactorAuthRepository.save(existing);
    } else {
      // Create new record
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

  async verifyAndEnableTwoFactor(userId: string, token: string) {
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
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
    await this.twoFactorAuthRepository.save(twoFactorAuth);

    return { message: 'Two-factor authentication enabled successfully' };
  }

  async verifyTwoFactorCode(userId: string, token: string): Promise<boolean> {
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
      where: { userId, isEnabled: 1 },
    });

    if (!twoFactorAuth) {
      return false; // 2FA not enabled
    }

    // First try TOTP
    if (this.verifyToken(twoFactorAuth.secret, token)) {
      return true;
    }

    // Then try backup codes
    const backupCodes = JSON.parse(twoFactorAuth.backupCodes || '[]');
    const codeIndex = backupCodes.indexOf(token);

    if (codeIndex !== -1) {
      // Remove used backup code
      backupCodes.splice(codeIndex, 1);
      twoFactorAuth.backupCodes = JSON.stringify(backupCodes);
      await this.twoFactorAuthRepository.save(twoFactorAuth);
      return true;
    }

    return false;
  }

  async disableTwoFactor(userId: string) {
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
      where: { userId },
    });

    if (!twoFactorAuth) {
      throw new BadRequestException('Two-factor authentication not set up');
    }

    // Disable 2FA
    twoFactorAuth.isEnabled = 0;
    twoFactorAuth.secret = '';
    twoFactorAuth.backupCodes = '';
    await this.twoFactorAuthRepository.save(twoFactorAuth);

    return { message: 'Two-factor authentication disabled successfully' };
  }

  async regenerateBackupCodes(userId: string) {
    const twoFactorAuth = await this.twoFactorAuthRepository.findOne({
      where: { userId, isEnabled: 1 },
    });

    if (!twoFactorAuth) {
      throw new BadRequestException('Two-factor authentication not enabled');
    }

    const backupCodes = this.generateBackupCodes();
    twoFactorAuth.backupCodes = JSON.stringify(backupCodes);
    await this.twoFactorAuthRepository.save(twoFactorAuth);

    return { backupCodes };
  }

  async getTwoFactorStatus(userId: string) {
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
}