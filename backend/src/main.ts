import { NestFactory } from '@nestjs/core';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = new Logger('Bootstrap');

  // Global prefix
  const apiPrefix = configService.get<string>('api.prefix', 'api');
  app.setGlobalPrefix(apiPrefix);

  // CORS
  const corsOrigin = configService.get<string>('cors.origin', '*');
  app.enableCors({
    origin: corsOrigin,
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Start server
  const port = configService.get<number>('port', 3000);
  await app.listen(port);

  logger.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(`Health endpoint: http://localhost:${port}/${apiPrefix}/health`);
}

void bootstrap();
