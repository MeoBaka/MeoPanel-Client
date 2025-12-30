import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PM2PermissionsService } from './pm2-permissions.service';
import { CreatePM2PermissionDto, UpdatePM2PermissionDto } from '../dto';
import { JwtAuthGuard } from '../jwt/jwt-auth.guard';

@Controller('pm2-permissions')
@UseGuards(JwtAuthGuard)
export class PM2PermissionsController {
  constructor(private readonly pm2PermissionsService: PM2PermissionsService) {}

  @Post()
  create(@Body() createPM2PermissionDto: CreatePM2PermissionDto) {
    return this.pm2PermissionsService.create(createPM2PermissionDto);
  }

  @Post('upsert')
  upsert(@Body() createPM2PermissionDto: CreatePM2PermissionDto) {
    return this.pm2PermissionsService.upsert(createPM2PermissionDto);
  }

  @Get()
  findAll() {
    return this.pm2PermissionsService.findAll();
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.pm2PermissionsService.findByUser(userId);
  }

  @Get('user/:userId/server/:serverId')
  findByUserAndServer(@Param('userId') userId: string, @Param('serverId') serverId: string) {
    return this.pm2PermissionsService.findByUserAndServer(userId, serverId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pm2PermissionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePM2PermissionDto: UpdatePM2PermissionDto) {
    return this.pm2PermissionsService.update(id, updatePM2PermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pm2PermissionsService.remove(id);
  }
}