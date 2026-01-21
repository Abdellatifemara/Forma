import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Security
  app.use(helmet());
  app.enableCors({
    origin: configService.get('CORS_ORIGINS')?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'https://formaeg.com',
    ],
    credentials: true,
  });

  // Validation
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

  // API prefix
  app.setGlobalPrefix('api');

  // Swagger documentation
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Forma API')
    .setDescription('Forma Fitness App API - Shape Your Future')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('exercises', 'Exercise library')
    .addTag('workouts', 'Workout plans and logging')
    .addTag('nutrition', 'Food database and meal tracking')
    .addTag('trainers', 'Trainer marketplace')
    .addTag('stats', 'Analytics and progress')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🏋️  FORMA API Server                                ║
  ║   Shape Your Future                                   ║
  ║                                                       ║
  ║   Server running on: http://localhost:${port}          ║
  ║   API Documentation: http://localhost:${port}/docs     ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
}

bootstrap();
