import { Controller, Get, Post, Body, Param, Put, Delete, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto } from '../dto';
import { JwtAuthGuard } from '../jwt';
import { RolesGuard, Roles } from '../auth/security.service';
import { UserRole } from '../entities/user.entity';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async create(@Body() userData: CreateUserDto) {
    const user = await this.userService.create(userData);
    return { message: 'User created successfully', data: user };
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async findAll() {
    const users = await this.userService.findAll();
    return { message: 'Users retrieved successfully', data: users };
  }

  @Get(':uuid')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async findOne(@Param('uuid') uuid: string) {
    const user = await this.userService.findOne(uuid);
    return { message: 'User retrieved successfully', data: user };
  }

  @Put(':uuid')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async update(@Param('uuid') uuid: string, @Body() userData: UpdateUserDto) {
    const user = await this.userService.update(uuid, userData);
    return { message: 'User updated successfully', data: user };
  }

  @Delete(':uuid')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async remove(@Param('uuid') uuid: string) {
    await this.userService.remove(uuid);
    return { message: 'User deleted successfully' };
  }
}