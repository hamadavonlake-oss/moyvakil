import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { JurisdictionsService } from './jurisdictions.service';
import { JurisdictionsController } from './jurisdictions.controller';

@Module({
  imports: [PrismaModule],
  controllers: [JurisdictionsController],
  providers: [JurisdictionsService],
  exports: [JurisdictionsService],
})
export class JurisdictionsModule {}
