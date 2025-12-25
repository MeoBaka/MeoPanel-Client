import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { User } from '../entities/user.entity';
import { EmailVerificationTokens } from '../entities/email-verification-tokens.entity';
import { AuditService } from '../audit/audit.service';
import { GenerateVerificationTokenDto, VerifyEmailDto, ResendVerificationDto } from '../dto';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(EmailVerificationTokens)
    private emailVerificationTokensRepository: Repository<EmailVerificationTokens>,
    private auditService: AuditService,
  ) {}

  async generateVerificationToken(dto: GenerateVerificationTokenDto) {
    const { userId, email } = dto;
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
    console.log(`Email verification link for ${email}: http://localhost:3000/verify-email?token=${verificationToken}`);

    // Audit log email verification sent
    await this.auditService.logEmailVerificationSent(userId, email);

    return verificationToken;
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const { token } = dto;
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

    // Update user email_verified_at and set status to active (1)
    verificationToken.user.emailVerifiedAt = new Date();
    verificationToken.user.status = 1; // Set status to active
    await this.userRepository.save(verificationToken.user);

    // Delete the verification token
    await this.emailVerificationTokensRepository.delete(verificationToken.id);

    console.log(`Email verified for user: ${verificationToken.user.email}`);

    // Audit log email verified
    await this.auditService.logEmailVerified(verificationToken.userId, verificationToken.user.email);

    return { message: 'Email verified successfully' };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const { email } = dto;
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
    await this.generateVerificationToken({ userId: user.id, email });

    return { message: 'Verification token sent. Please check console for the token.' };
  }
}