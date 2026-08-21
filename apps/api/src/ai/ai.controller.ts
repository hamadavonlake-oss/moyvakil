import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AskDto, ChatDto } from './dto/ai.dto';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private aiService: AiService) {}

  @Post('ask')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Ask a legal question (RAG-powered)' })
  ask(@Body() dto: AskDto) {
    return this.aiService.ask(dto);
  }

  @Post('chat')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Chat with AI legal assistant (alias for /ask)' })
  chat(@Body() dto: ChatDto) {
    return this.aiService.ask({ question: dto.message, language: dto.language, countryId: dto.countryId });
  }
}
