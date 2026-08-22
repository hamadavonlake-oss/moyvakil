import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post('sessions')
  @ApiOperation({ summary: 'Create a new chat session' })
  createConversation(@Request() req: any, @Body() dto: CreateConversationDto) {
    return this.chatService.createConversation(req.user.id, dto);
  }

  @Get('sessions')
  @ApiOperation({ summary: 'List your chat sessions' })
  listConversations(@Request() req: any) {
    return this.chatService.listConversations(req.user.id);
  }

  @Get('sessions/:id')
  @ApiOperation({ summary: 'Get a chat session with messages' })
  getConversation(@Request() req: any, @Param('id') id: string) {
    return this.chatService.getConversation(req.user.id, id);
  }

  @Post('sessions/:id/messages')
  @ApiOperation({ summary: 'Send a message and get AI response' })
  sendMessage(@Request() req: any, @Param('id') id: string, @Body() dto: SendMessageDto) {
    return this.chatService.sendMessage(req.user.id, id, dto);
  }

  @Get('messages/:messageId/answer')
  @ApiOperation({ summary: 'Get structured answer for a message' })
  getAnswer(@Param('messageId') messageId: string) {
    return this.chatService.getAnswer(messageId);
  }
}
