import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PM2Permissions } from '../entities/pm2-permissions.entity';
import { PM2PermissionsService } from './pm2-permissions.service';
import { PM2PermissionsController } from './pm2-permissions.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PM2Permissions])],
  providers: [PM2PermissionsService],
  controllers: [PM2PermissionsController],
  exports: [PM2PermissionsService],
})
export class PM2PermissionsModule {}