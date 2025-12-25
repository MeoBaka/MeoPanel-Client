import { IsString, IsNotEmpty } from 'class-validator';

export class RegenerateBackupCodesDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  verificationToken: string;

  @IsString()
  @IsNotEmpty()
  currentPassword: string;
}