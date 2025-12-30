import { IsArray, IsEnum, IsOptional } from 'class-validator';
import { PM2Permission } from '../entities/pm2-permissions.entity';

export class UpdatePM2PermissionDto {
  @IsOptional()
  @IsArray()
  @IsEnum(PM2Permission, { each: true })
  permissions?: PM2Permission[];
}