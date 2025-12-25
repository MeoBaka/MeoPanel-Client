import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerificationService } from './email-verification.service';
import { User } from '../entities/user.entity';
import { EmailVerificationTokens } from '../entities/email-verification-tokens.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, EmailVerificationTokens]),
    AuditModule,
  ],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}