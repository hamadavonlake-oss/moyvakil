import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { CreateConversationDto, SendMessageDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private prisma: PrismaService,
    private aiService: AiService,
  ) {}

  async createConversation(userId: string, dto: CreateConversationDto) {
    return this.prisma.conversation.create({
      data: {
        userId,
        countryCode: dto.countryCode,
        language: dto.language || 'uz',
      },
    });
  }

  async listConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: { _count: { select: { messages: true } } },
    });
  }

  async getConversation(userId: string, id: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          include: { answer: { include: { citations: true } } },
        },
      },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.userId !== userId) throw new ForbiddenException('Access denied');
    return conversation;
  }

  async sendMessage(userId: string, conversationId: string, dto: SendMessageDto) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    if (conversation.userId !== userId) throw new ForbiddenException('Access denied');

    const userMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: 'user',
        content: dto.content,
      },
    });

    const startTime = Date.now();
    const aiResponse: any = await this.aiService.ask({
      question: dto.content,
      language: conversation.language,
      countryCode: conversation.countryCode,
    });
    const latencyMs = Date.now() - startTime;

    const assistantMessage = await this.prisma.message.create({
      data: {
        conversationId,
        role: 'assistant',
        content: typeof aiResponse === 'string' ? aiResponse : aiResponse.answer,
      },
    });

    const responseData = typeof aiResponse === 'string'
      ? {
          jurisdiction: conversation.countryCode,
          language: conversation.language,
          shortAnswer: aiResponse.substring(0, 200),
          answer: aiResponse,
          assumptions: [],
          missingFacts: [],
          citations: [],
          nextSteps: [],
          riskLevel: 'low' as const,
          needsHumanReview: false,
          confidence: 0.3,
          disclaimer: 'This is automated legal information, not professional legal advice.',
        }
      : aiResponse;

    const answer = await this.prisma.answer.create({
      data: {
        messageId: assistantMessage.id,
        jurisdiction: responseData.jurisdiction || conversation.countryCode,
        language: responseData.language || conversation.language,
        shortAnswer: responseData.shortAnswer,
        answer: responseData.answer,
        assumptions: responseData.assumptions || [],
        missingFacts: responseData.missingFacts || [],
        nextSteps: responseData.nextSteps || [],
        riskLevel: responseData.riskLevel || 'low',
        needsHumanReview: responseData.needsHumanReview || false,
        confidence: responseData.confidence || 0,
        disclaimer: responseData.disclaimer || '',
        latencyMs,
      },
    });

    if (responseData.citations && Array.isArray(responseData.citations)) {
      for (const citation of responseData.citations) {
        await this.prisma.citation.create({
          data: {
            answerId: answer.id,
            sourceId: citation.sourceId || null,
            sectionId: citation.sectionId || null,
            title: citation.title || 'Unknown',
            article: citation.article || null,
            url: citation.url || null,
            effectiveDate: citation.effectiveDate ? new Date(citation.effectiveDate) : null,
            status: citation.status || null,
            quotedText: citation.quotedText || null,
          },
        });
      }
    }

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        updatedAt: new Date(),
        title: conversation.title || dto.content.substring(0, 100),
      },
    });

    return {
      userMessage,
      assistantMessage,
      answer: {
        ...answer,
        citations: await this.prisma.citation.findMany({
          where: { answerId: answer.id },
        }),
      },
    };
  }

  async getAnswer(messageId: string) {
    const answer = await this.prisma.answer.findUnique({
      where: { messageId },
      include: { citations: true },
    });
    if (!answer) throw new NotFoundException('Answer not found for this message');
    return answer;
  }
}
