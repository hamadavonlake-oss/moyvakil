import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { LawsModule } from './laws/laws.module';
import { JurisdictionsModule } from './jurisdictions/jurisdictions.module';
import { AdminModule } from './admin/admin.module';
import { AiModule } from './ai/ai.module';
import { ChatModule } from './chat/chat.module';
import { SearchModule } from './search/search.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    AuthModule,
    LawsModule,
    JurisdictionsModule,
    AdminModule,
    AiModule,
    ChatModule,
    SearchModule,
  ],
})
export class AppModule {}
