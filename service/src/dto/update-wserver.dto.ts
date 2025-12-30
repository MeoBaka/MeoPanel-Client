import { IsOptional, IsString, IsUrl } from 'class-validator';

export class UpdateWserverDto {
  @IsOptional()
  @IsString()
  servername?: string;

  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsString()
  uuid?: string;

  @IsOptional()
  @IsString()
  token?: string;
}