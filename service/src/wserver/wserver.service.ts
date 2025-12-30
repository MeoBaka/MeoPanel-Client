import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wserver } from '../entities/wserver.entity';
import { CreateWserverDto, UpdateWserverDto } from '../dto';

@Injectable()
export class WserverService {
  constructor(
    @InjectRepository(Wserver)
    private readonly wserverRepository: Repository<Wserver>,
  ) {}

  async create(wserverData: CreateWserverDto): Promise<Wserver> {
    const wserver = this.wserverRepository.create(wserverData);
    return this.wserverRepository.save(wserver);
  }

  async findAll(): Promise<Wserver[]> {
    return this.wserverRepository.find();
  }

  async findOne(id: string): Promise<Wserver> {
    const wserver = await this.wserverRepository.findOne({ where: { id } });
    if (!wserver) {
      throw new NotFoundException(`Wserver with ID ${id} not found`);
    }
    return wserver;
  }

  async update(id: string, wserverData: UpdateWserverDto): Promise<Wserver> {
    await this.wserverRepository.update(id, wserverData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.wserverRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Wserver with ID ${id} not found`);
    }
  }

  async getServerStatus(id: string): Promise<any> {
    const wserver = await this.findOne(id);
    // TODO: Implement WebSocket connection to server
    // Send: { "uuid": wserver.uuid, "token": wserver.token }
    // Receive: server status data
    throw new Error('WebSocket connection not implemented yet');
  }
}