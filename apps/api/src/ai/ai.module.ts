import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { EmbeddingService } from './embedding.service';
import { EmbeddingController } from './embedding.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController, EmbeddingController],
  providers: [AiService, EmbeddingService],
  exports: [AiService, EmbeddingService],
})
export class AiModule {}
