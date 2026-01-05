import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SecurityExceptionFilter } from './auth/security.exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Apply global security exception filter
  app.useGlobalFilters(new SecurityExceptionFilter());

  // Enable CORS for frontend
  const corsOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'];
  app.enableCors({
    origin: corsOrigins, // Allow frontend origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  const port = process.env.SERVICE_PORT;
  const host = process.env.SERVICE_HOST || 'localhost';
  if (!port) {
    throw new Error('SERVICE_PORT is not defined in environment variables');
  }
  await app.listen(port, host);
  console.log(`Service is running on ${host}:${port}`);
}
bootstrap();