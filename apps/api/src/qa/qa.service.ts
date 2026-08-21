import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuestionDto, CreateAnswerDto, QuestionQueryDto } from './dto/qa.dto';

@Injectable()
export class QaService {
  constructor(private prisma: PrismaService) {}

  async findQuestions(query: QuestionQueryDto) {
    const { category, region, language, countryId, q, page = 1, limit = 20 } = query;

    const where: any = {};
    if (countryId) where.countryId = countryId;
    if (category) where.category = category;
    if (region) where.region = region;
    if (language) where.language = language;
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { body: { contains: q, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.question.findMany({
        where,
        include: { _count: { select: { answers: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
      }),
      this.prisma.question.count({ where }),
    ]);

    return { items, total, page: Number(page), limit: Number(limit) };
  }

  async findQuestionById(id: string) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: {
        answers: {
          include: { lawyer: { select: { id: true, firstName: true, lastName: true, slug: true, photoUrl: true, isVerified: true } } },
          orderBy: { upvotes: 'desc' },
        },
      },
    });
    if (!question) throw new NotFoundException(`Question "${id}" not found`);

    await this.prisma.question.update({ where: { id }, data: { viewCount: { increment: 1 } } });
    return question;
  }

  async createQuestion(dto: CreateQuestionDto) {
    let countryId = dto.countryId;
    if (!countryId) {
      const uz = await this.prisma.country.findUnique({ where: { code: 'UZ' } });
      countryId = uz?.id;
    }

    return this.prisma.question.create({
      data: {
        title: dto.title,
        body: dto.body,
        category: dto.category || 'civil',
        language: dto.language || 'uz',
        authorName: dto.authorName || 'User',
        region: dto.region || null,
        countryId: countryId || '',
      },
    });
  }

  async createAnswer(questionId: string, dto: CreateAnswerDto) {
    const question = await this.prisma.question.findUnique({ where: { id: questionId } });
    if (!question) throw new NotFoundException(`Question "${questionId}" not found`);

    const answer = await this.prisma.qaAnswer.create({
      data: { questionId, ...dto },
    });

    await this.prisma.question.update({
      where: { id: questionId },
      data: { answerCount: { increment: 1 } },
    });

    return answer;
  }

  async markHelpful(answerId: string) {
    const answer = await this.prisma.qaAnswer.findUnique({ where: { id: answerId } });
    if (!answer) throw new NotFoundException(`Answer "${answerId}" not found`);

    return this.prisma.qaAnswer.update({
      where: { id: answerId },
      data: { isHelpful: true },
    });
  }
}
