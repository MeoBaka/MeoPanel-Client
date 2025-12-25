import { IsString, IsNotEmpty } from 'class-validator';

export class SetupTwoFactorDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}