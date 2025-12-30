import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { WsModule } from './ws/ws.module';
import { DatabaseModule } from './database.module';
import { AuditModule } from './audit/audit.module';
import { WserverModule } from './wserver/wserver.module';
import { PM2PermissionsModule } from './pm2-permissions/pm2-permissions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '../.env',
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UserModule,
    WsModule,
    AuditModule,
    WserverModule,
    PM2PermissionsModule,
  ],
})
export class AppModule {}