import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../entities/user.entity';
import { AuthCredentials } from '../entities/auth-credentials.entity';
import { AuthSessions } from '../entities/auth-sessions.entity';
import { AuthLoginLogs } from '../entities/auth-login-logs.entity';
import { PasswordResetTokens } from '../entities/password-reset-tokens.entity';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';
import { JwtModule } from '../jwt';
import { EmailVerificationModule } from '../email-verification';
import { AuditModule } from '../audit/audit.module';
import { TwoFactorModule } from '../twofa/two-factor.module';
import { SecurityService, RolesGuard } from './security.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, AuthCredentials, AuthSessions, AuthLoginLogs, PasswordResetTokens, TwoFactorAuth]),
    JwtModule,
    EmailVerificationModule,
    AuditModule,
    TwoFactorModule,
  ],
  providers: [AuthService, SecurityService, RolesGuard],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}