import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { LawsService } from './laws.service';
import { LawsController, LegalSectionsController } from './laws.controller';

@Module({
  imports: [PrismaModule],
  controllers: [LawsController, LegalSectionsController],
  providers: [LawsService],
  exports: [LawsService],
})
export class LawsModule {}
