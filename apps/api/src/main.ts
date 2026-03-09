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

  // CORS - Allow production, Expo, and local development
  const allowedOrigins = configService.get('CORS_ORIGINS')?.split(',') || [];
  // Always allow production domain
  if (!allowedOrigins.includes('https://formaeg.com')) {
    allowedOrigins.push('https://formaeg.com');
  }
  const isProd = configService.get('NODE_ENV') === 'production';

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Require an origin header — no-origin requests are not browsers and
      // should be handled at the infrastructure level (Nginx/Cloudflare), not here.
      if (!origin) {
        return callback(new Error('Origin header required'));
      }

      // Check explicit allowed origins (production domain + any from env)
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      // Allow localhost and Expo only in non-production environments
      if (!isProd) {
        if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
          return callback(null, true);
        }
        if (origin.startsWith('exp://')) {
          return callback(null, true);
        }
      }

      // Reject everything else
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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
