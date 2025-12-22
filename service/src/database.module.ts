import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        url: config.get<string>('DATABASE_URL'),
        migrations: [__dirname + 'dist/migrations/*.js'],
        synchronize: false,
        migrationsRun: true,
      }),
    }),
  ],
})
export class DatabaseModule {}