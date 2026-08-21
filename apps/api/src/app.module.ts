import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LawsModule } from './laws/laws.module';
import { LawyersModule } from './lawyers/lawyers.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ServicesModule } from './services/services.module';
import { QaModule } from './qa/qa.module';
import { GuidesModule } from './guides/guides.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    LawsModule,
    LawyersModule,
    ReviewsModule,
    ServicesModule,
    QaModule,
    GuidesModule,
    AdminModule,
    AiModule,
  ],
})
export class AppModule {}
