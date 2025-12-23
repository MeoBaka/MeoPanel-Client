import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TwoFactorService } from './two-factor.service';
import { TwoFactorAuth } from '../entities/two-factor-auth.entity';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TwoFactorAuth]),
    AuditModule,
  ],
  providers: [TwoFactorService],
  exports: [TwoFactorService],
})
export class TwoFactorModule {}