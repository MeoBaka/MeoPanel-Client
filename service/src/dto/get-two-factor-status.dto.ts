import { IsString, IsNotEmpty } from 'class-validator';

export class GetTwoFactorStatusDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}