import { IsNumber } from 'class-validator';

export class UpdateUserStatusDto {
  @IsNumber()
  status: number;
}