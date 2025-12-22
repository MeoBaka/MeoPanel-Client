import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.SERVICE_PORT;
  if (!port) {
    throw new Error('SERVICE_PORT is not defined in environment variables');
  }
  await app.listen(port);
}
bootstrap();