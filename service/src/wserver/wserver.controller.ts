import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards, Request } from '@nestjs/common';
import { WserverService } from './wserver.service';
import { Wserver } from '../entities/wserver.entity';
import { CreateWserverDto, UpdateWserverDto } from '../dto';
import { JwtAuthGuard } from '../jwt';
import { RolesGuard, Roles } from '../auth/security.service';
import { UserRole } from '../entities/user.entity';

@Controller('wservers')
export class WserverController {
  constructor(private readonly wserverService: WserverService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async create(@Body() wserverData: CreateWserverDto) {
    const wserver = await this.wserverService.create(wserverData);
    return { message: 'Wserver created successfully', data: wserver };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAll(@Request() req) {
    const user = req.user;
    const wservers = await this.wserverService.findAllForUser(user.id, user.role);
    return { message: 'Wservers retrieved successfully', data: wservers };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const wserver = await this.wserverService.findOne(id);
    return { message: 'Wserver retrieved successfully', data: wserver };
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async update(@Param('id') id: string, @Body() wserverData: UpdateWserverDto) {
    const wserver = await this.wserverService.update(id, wserverData);
    return { message: 'Wserver updated successfully', data: wserver };
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async remove(@Param('id') id: string) {
    await this.wserverService.remove(id);
    return { message: 'Wserver deleted successfully' };
  }

  @Get(':id/status')
  async getStatus(@Param('id') id: string) {
    const status = await this.wserverService.getServerStatus(id);
    return { message: 'Server status retrieved successfully', data: status };
  }
}
