import { IsUUID, IsString, IsArray, IsEnum } from 'class-validator';
import { PM2Permission } from '../entities/pm2-permissions.entity';

export class CreatePM2PermissionDto {
  @IsUUID()
  userId: string;

  @IsUUID()
  wserverId: string;

  @IsString()
  pm2ProcessName: string;

  @IsArray()
  @IsEnum(PM2Permission, { each: true })
  permissions: PM2Permission[];
}