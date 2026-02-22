import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
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
import { ProgressModule } from './modules/progress/progress.module';
import { UploadModule } from './modules/upload/upload.module';
import { SettingsModule } from './modules/settings/settings.module';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { UserProfileModule } from './modules/user-profile/user-profile.module';
import { ChatModule } from './modules/chat/chat.module';
import { PaymentsModule } from './modules/payments/payments.module';
import { ProgramsModule } from './modules/programs/programs.module';
import { AdminModule } from './modules/admin/admin.module';
import { AchievementsModule } from './modules/achievements/achievements.module';
import { SquadsModule } from './modules/squads/squads.module';
import { HealthDataModule } from './modules/health-data/health-data.module';
import { BodyCompositionModule } from './modules/body-composition/body-composition.module';
import { GamificationModule } from './modules/gamification/gamification.module';
import { InjuryModificationsModule } from './modules/injury-modifications/injury-modifications.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { CommissionsModule } from './modules/commissions/commissions.module';
import { ResearchModule } from './modules/research/research.module';
import { HealthMetricsModule } from './modules/health-metrics/health-metrics.module';
import { CheckInsModule } from './modules/check-ins/check-ins.module';
import { ScheduledCallsModule } from './modules/scheduled-calls/scheduled-calls.module';
import { EmailModule } from './modules/email/email.module';
import { ErrorReportingModule } from './modules/error-reporting/error-reporting.module';
import { DevicesModule } from './modules/devices/devices.module';
import { NotificationsModule } from './modules/notifications/notifications.module';

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
        limit: 10,
      },
      {
        name: 'medium',
        ttl: 10000,
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000,
        limit: 300,
      },
    ]),

    // Core
    PrismaModule,
    HealthModule,
    EmailModule,

    // All feature modules
    AuthModule,
    UsersModule,
    UserProfileModule,
    ExercisesModule,
    WorkoutsModule,
    NutritionModule,
    ProgressModule,
    AiModule,
    SettingsModule,
    UploadModule,
    SubscriptionsModule,
    TrainersModule,
    StatsModule,
    VideosModule,
    ChatModule,
    PaymentsModule,
    ProgramsModule,
    AdminModule,
    AchievementsModule,
    SquadsModule,
    HealthDataModule,
    BodyCompositionModule,
    GamificationModule,
    InjuryModificationsModule,
    AnalyticsModule,
    CommissionsModule,
    ResearchModule,
    HealthMetricsModule,
    CheckInsModule,
    ScheduledCallsModule,
    ErrorReportingModule,
    DevicesModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
