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

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  countryId?: string;
}

export class EmbedContentDto {
  @ApiProperty() @IsString() contentId: string;
  @ApiProperty() @IsString() contentType: string;
  @ApiProperty({ type: [String] }) chunks: string[];
  @ApiPropertyOptional() metadata?: Record<string, any>;
}
