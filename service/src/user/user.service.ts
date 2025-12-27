import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { CreateUserDto, UpdateUserDto, UpdateUserRoleDto, UpdateUserStatusDto } from '../dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: CreateUserDto): Promise<User> {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userData.email)) {
      throw new BadRequestException('Invalid email format');
    }
    const user = this.userRepository.create(userData);
    return this.userRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async findOne(id: string): Promise<User> {
    return this.userRepository.findOne({ where: { id } });
  }

  async update(id: string, userData: UpdateUserDto): Promise<User> {
    await this.userRepository.update(id, userData);
    return this.findOne(id);
  }

  async updateRole(id: string, roleData: UpdateUserRoleDto): Promise<User> {
    await this.userRepository.update(id, { role: roleData.role });
    return this.findOne(id);
  }

  async updateStatus(id: string, statusData: UpdateUserStatusDto): Promise<User> {
    await this.userRepository.update(id, { status: statusData.status });
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }
}