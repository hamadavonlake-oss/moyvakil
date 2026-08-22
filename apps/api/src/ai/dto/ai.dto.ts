import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AskDto {
  @ApiProperty({ example: 'What are my rights if my employer fires me without notice?' })
  @IsString()
  question: string;

  @ApiPropertyOptional({ enum: ['uz', 'ru', 'en'], default: 'ru' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: 'UZ' })
  @IsString()
  @IsOptional()
  countryCode?: string;
}

export class ChatDto {
  @ApiProperty({ example: 'How do I register a company in Uzbekistan?' })
  @IsString()
  message: string;

  @ApiPropertyOptional({ enum: ['uz', 'ru', 'en'], default: 'ru' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ example: 'UZ' })
  @IsString()
  @IsOptional()
  countryCode?: string;
}

export class EmbedContentDto {
  @ApiProperty() @IsString() contentId: string;
  @ApiProperty() @IsString() contentType: string;
  @ApiProperty({ type: [String] }) chunks: string[];
  @ApiPropertyOptional() metadata?: Record<string, any>;
}
