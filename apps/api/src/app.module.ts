import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './modules/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ExercisesModule } from './modules/exercises/exercises.module';
import { WorkoutsModule } from './modules/workouts/workouts.module';
import { NutritionModule } from './modules/nutrition/nutrition.module';
import { TrainersModule } from './modules/trainers/trainers.module';
import { StatsModule } from './modules/stats/stats.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 1000,
        limit: 3,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 20,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 100,
      },
    ]),

    // Core modules
    PrismaModule,
    HealthModule,

    // Feature modules
    AuthModule,
    UsersModule,
    ExercisesModule,
    WorkoutsModule,
    NutritionModule,
    TrainersModule,
    StatsModule,
  ],
})
export class AppModule {}
