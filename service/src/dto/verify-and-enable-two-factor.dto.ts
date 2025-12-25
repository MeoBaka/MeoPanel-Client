import { IsString, IsNotEmpty } from 'class-validator';

export class VerifyAndEnableTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}