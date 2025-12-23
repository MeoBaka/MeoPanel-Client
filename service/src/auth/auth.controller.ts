import { Controller, Post, Body, Request, UseGuards, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TwoFactorService } from '../twofa/two-factor.service';
import { JwtAuthGuard } from '../jwt';
import { RolesGuard, Roles } from './security.service';
import { UserRole } from '../entities/user.entity';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  @Post('register')
  async register(@Body() body: { username: string; email: string; password: string; name?: string }) {
    return this.authService.register(body);
  }

  @Post('login')
  async login(@Body() body: { usernameOrEmail: string; password: string }, @Request() req) {
    return this.authService.login(body, req.ip, req.get('User-Agent'));
  }

  @Post('refresh')
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Post('me')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body.email);
  }

  @Post('reset-password')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    return this.authService.resetPassword(body.token, body.newPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(@Request() req, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.authService.changePassword(req.user.id, body.currentPassword, body.newPassword, req.ip, req.get('User-Agent'));
  }

  @Post('logout')
  async logout(@Body() body: { refreshToken: string }, @Request() req) {
    return this.authService.logout(body.refreshToken, req.ip, req.get('User-Agent'));
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout-all')
  async logoutAll(@Request() req) {
    return this.authService.logoutAll(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/setup')
  async setupTwoFactor(@Request() req) {
    return this.twoFactorService.setupTwoFactor(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/verify')
  async verifyTwoFactor(@Request() req, @Body() body: { token: string }) {
    return this.twoFactorService.verifyAndEnableTwoFactor(req.user.id, body.token);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/disable')
  async disableTwoFactor(@Request() req) {
    return this.twoFactorService.disableTwoFactor(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/regenerate-backup')
  async regenerateBackupCodes(@Request() req) {
    return this.twoFactorService.regenerateBackupCodes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('2fa/status')
  async getTwoFactorStatus(@Request() req) {
    return this.twoFactorService.getTwoFactorStatus(req.user.id);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  @Get('users')
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

}