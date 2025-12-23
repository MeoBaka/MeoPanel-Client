import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorService } from './two-factor.service';
import { TwofaAuth } from '../entities/twofa-auth.entity';
import { TwofaBackupCode } from '../entities/twofa-backupcode.entity';
import { User } from '../entities/user.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TwofaAuth, TwofaBackupCode, User]),
    AuditModule,
  ],
  providers: [TwoFactorService],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}