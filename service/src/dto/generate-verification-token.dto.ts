import { IsString, IsNotEmpty } from 'class-validator';

export class GenerateVerificationTokenDto {
  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  email: string;
}