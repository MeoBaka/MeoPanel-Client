import { Controller, Post, Body } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';

@Controller('email-verification')
export class EmailVerificationController {
  constructor(private readonly emailVerificationService: EmailVerificationService) {}

  @Post('verify')
  async verifyEmail(@Body() body: { token: string }) {
    return this.emailVerificationService.verifyEmail(body.token);
  }

  @Post('resend')
  async resendVerification(@Body() body: { email: string }) {
    return this.emailVerificationService.resendVerification(body.email);
  }
}