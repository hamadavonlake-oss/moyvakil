import { Controller, Get, Post, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QaService } from './qa.service';
import { CreateQuestionDto, CreateAnswerDto, QuestionQueryDto } from './dto/qa.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('Q&A')
@Controller('qa')
export class QaController {
  constructor(private qaService: QaService) {}

  @Get('questions')
  @ApiOperation({ summary: 'List questions with filters' })
  findQuestions(@Query() query: QuestionQueryDto) {
    return this.qaService.findQuestions(query);
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question with answers' })
  findQuestionById(@Param('id') id: string) {
    return this.qaService.findQuestionById(id);
  }

  @Post('questions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post a new question' })
  createQuestion(@Body() dto: CreateQuestionDto) {
    return this.qaService.createQuestion(dto);
  }

  @Post('questions/:id/answers')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Answer a question' })
  createAnswer(@Param('id') id: string, @Body() dto: CreateAnswerDto) {
    return this.qaService.createAnswer(id, dto);
  }

  @Post('answers/:id/helpful')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Mark an answer as helpful' })
  markHelpful(@Param('id') id: string) {
    return this.qaService.markHelpful(id);
  }
}
