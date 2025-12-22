import { Injectable } from '@nestjs/common';
import { JwtService as NestJwtService } from '@nestjs/jwt';

@Injectable()
export class JwtService {
  constructor(private readonly nestJwtService: NestJwtService) {}

  generateAccessToken(payload: any): string {
    return this.nestJwtService.sign(payload);
  }

  generateRefreshToken(payload: any): string {
    return this.nestJwtService.sign(payload, { expiresIn: '7d' });
  }

  verifyToken(token: string): any {
    return this.nestJwtService.verify(token);
  }

  decodeToken(token: string): any {
    return this.nestJwtService.decode(token);
  }
}