import { Module } from '@nestjs/common';
// import { CacheModule } from '@nestjs/cache-manager'; // TODO: Re-enable after fixing version conflict
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
import { VideosModule } from './modules/videos/videos.module';
import { AiModule } from './modules/ai/ai.module';
import { AdminModule } from './modules/admin/admin.module';
import { ProgressModule } from './modules/progress/progress.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { UploadModule } from './modules/upload/upload.module';
import { ChatModule } from './modules/chat/chat.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SquadsModule } from './modules/squads/squads.module';
import { HealthDataModule } from './modules/health-data/health-data.module';
import { BodyCompositionModule } from './modules/body-composition/body-composition.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { InjuryModificationsModule } from './modules/injury-modifications/injury-modifications.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { ResearchModule } from './modules/research/research.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';

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

    // Caching - TODO: Re-enable after fixing version conflict
    // CacheModule.register({
    //   isGlobal: true,
    //   ttl: 60, // seconds
    // }),

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
    VideosModule,
    AiModule,
    AdminModule,
    ProgressModule,
    AchievementsModule,
    UploadModule,
    ChatModule,
    SettingsModule,
    SquadsModule,
    HealthDataModule,
    BodyCompositionModule,
    GamificationModule,
    InjuryModificationsModule,
    ProgramsModule,
    SubscriptionsModule,
    PaymentsModule,
    AnalyticsModule,
    CommissionsModule,
    ResearchModule,
    UserProfileModule,
  ],
})
export class AppModule {}
