import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wserver } from '../entities/wserver.entity';
import { WserverService } from './wserver.service';
import { WserverController } from './wserver.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Wserver])],
  controllers: [WserverController],
  providers: [WserverService],
  exports: [WserverService],
})
export class WserverModule {}