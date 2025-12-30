import { IsString, IsUrl } from 'class-validator';

export class CreateWserverDto {
  @IsString()
  servername: string;

  @IsUrl()
  url: string;

  @IsString()
  uuid: string;

  @IsString()
  token: string;
}