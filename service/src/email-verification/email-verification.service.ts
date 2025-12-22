import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { EmailVerificationTokens } from '../entities/email-verification-tokens.entity';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerificationTokens)
    private emailVerificationTokensRepository: Repository<EmailVerificationTokens>,
  ) {}

  async generateVerificationToken(userId: string, email: string) {
    // Delete any existing verification tokens for this user
    await this.emailVerificationTokensRepository.delete({ userId });

    // Generate new verification token
    const verificationToken = crypto.randomBytes(64).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

    const emailToken = this.emailVerificationTokensRepository.create({
      userId,
      token: verificationToken,
      expiresAt,
    });
    await this.emailVerificationTokensRepository.save(emailToken);

    // Log verification token (since email sending is not implemented)
    console.log(`Email verification token for ${email}: ${verificationToken}`);

    return verificationToken;
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.emailVerificationTokensRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verificationToken) {
      throw new UnauthorizedException('Invalid verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      throw new UnauthorizedException('Verification token has expired');
    }

    // Update user email_verified_at
    verificationToken.user.emailVerifiedAt = new Date();
    await this.userRepository.save(verificationToken.user);

    // Delete the verification token
    await this.emailVerificationTokensRepository.delete(verificationToken.id);

    console.log(`Email verified for user: ${verificationToken.user.email}`);

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email: string) {
    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Check if email is already verified
    if (user.emailVerifiedAt) {
      throw new ConflictException('Email is already verified');
    }

    // Generate new token
    await this.generateVerificationToken(user.id, email);

    return { message: 'Verification token sent. Please check console for the token.' };
  }
}