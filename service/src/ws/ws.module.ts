import { Module } from '@nestjs/common';
import { WserverModule } from '../wserver/wserver.module';

@Module({
  imports: [WserverModule],
})
export class WsModule {}