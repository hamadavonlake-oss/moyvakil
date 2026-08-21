import { Controller, Post, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { EmbeddingService } from './embedding.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../auth/guards/roles.guard';
import { UserRole } from '@prisma/client';

@ApiTags('Embeddings')
@Controller('ai/embeddings')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.SUPER_ADMIN)
@ApiBearerAuth()
export class EmbeddingController {
  constructor(private embeddingService: EmbeddingService) {}

  @Post('index-laws')
  @ApiOperation({ summary: 'Index all laws into vector store (super admin)' })
  indexLaws() {
    return this.embeddingService.indexAllLaws();
  }

  @Post('index-guides')
  @ApiOperation({ summary: 'Index all guides into vector store (super admin)' })
  indexGuides() {
    return this.embeddingService.indexAllGuides();
  }

  @Post('index-all')
  @ApiOperation({ summary: 'Index all content into vector store (super admin)' })
  async indexAll() {
    const [laws, guides] = await Promise.all([
      this.embeddingService.indexAllLaws(),
      this.embeddingService.indexAllGuides(),
    ]);
    return { laws, guides };
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
