import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmbeddingService } from './embedding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';

@ApiTags('Embeddings')
@Controller('ai/embeddings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('super_admin')
@ApiBearerAuth()
export class EmbeddingController {
  constructor(private embeddingService: EmbeddingService) {}

  @Post('index-sections')
  @ApiOperation({ summary: 'Index all legal sections into vector store (super admin)' })
  indexSections() {
    return this.embeddingService.indexAllSections();
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get embedding stats (super admin)' })
  stats() {
    return this.embeddingService.getStats();
  }

  @Post('clear')
  @ApiOperation({ summary: 'Clear all embeddings (super admin)' })
  clear() {
    return this.embeddingService.clearAll();
  }
}
