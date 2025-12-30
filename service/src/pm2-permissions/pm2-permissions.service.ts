import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PM2Permissions } from '../entities/pm2-permissions.entity';
import { CreatePM2PermissionDto, UpdatePM2PermissionDto } from '../dto';

@Injectable()
export class PM2PermissionsService {
  constructor(
    @InjectRepository(PM2Permissions)
    private readonly pm2PermissionsRepository: Repository<PM2Permissions>,
  ) {}

  async create(createDto: CreatePM2PermissionDto): Promise<PM2Permissions> {
    const permission = this.pm2PermissionsRepository.create(createDto);
    return this.pm2PermissionsRepository.save(permission);
  }

  async findAll(): Promise<PM2Permissions[]> {
    return this.pm2PermissionsRepository.find({
      relations: ['user', 'wserver'],
    });
  }

  async findByUser(userId: string): Promise<PM2Permissions[]> {
    return this.pm2PermissionsRepository.find({
      where: { userId },
      relations: ['user', 'wserver'],
    });
  }

  async findByUserAndServer(userId: string, wserverId: string): Promise<PM2Permissions[]> {
    return this.pm2PermissionsRepository.find({
      where: { userId, wserverId },
      relations: ['user', 'wserver'],
    });
  }

  async findOne(id: string): Promise<PM2Permissions> {
    const permission = await this.pm2PermissionsRepository.findOne({
      where: { id },
      relations: ['user', 'wserver'],
    });
    if (!permission) {
      throw new NotFoundException(`PM2 permission with ID ${id} not found`);
    }
    return permission;
  }

  async update(id: string, updateDto: UpdatePM2PermissionDto): Promise<PM2Permissions> {
    const permission = await this.findOne(id);
    Object.assign(permission, updateDto);
    return this.pm2PermissionsRepository.save(permission);
  }

  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);
    await this.pm2PermissionsRepository.remove(permission);
  }

  async findByUserServerProcess(userId: string, wserverId: string, pm2ProcessName: string): Promise<PM2Permissions | null> {
    return this.pm2PermissionsRepository.findOne({
      where: { userId, wserverId, pm2ProcessName },
      relations: ['user', 'wserver'],
    });
  }

  async upsert(createDto: CreatePM2PermissionDto): Promise<PM2Permissions> {
    const existing = await this.findByUserServerProcess(createDto.userId, createDto.wserverId, createDto.pm2ProcessName);
    if (existing) {
      return this.update(existing.id, { permissions: createDto.permissions });
    }
    return this.create(createDto);
  }
}