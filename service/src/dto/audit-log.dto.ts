import { IsString, IsOptional, IsBoolean, IsEnum } from 'class-validator';
import { AuditAction, AuditResource } from '../entities/audit-logs.entity';

export class AuditLogDto {
  @IsOptional()
  @IsString()
  userId?: string;

  @IsEnum(AuditAction)
  action: AuditAction;

  @IsEnum(AuditResource)
  resource: AuditResource;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsString()
  userAgent?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  metadata?: any;

  @IsOptional()
  @IsBoolean()
  isSuccess?: boolean;
}