import { IsString, IsNotEmpty } from 'class-validator';

export class DisableTwoFactorDto {
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