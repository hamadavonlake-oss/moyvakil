import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateQuestionDto {
  @ApiProperty() @IsString() countryId: string;
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() body: string;
  @ApiProperty() @IsString() category: string;
  @ApiPropertyOptional() @IsString() @IsOptional() region?: string;
  @ApiProperty() @IsString() language: string;
  @ApiProperty() @IsString() authorName: string;
}

export class CreateAnswerDto {
  @ApiProperty() @IsString() body: string;
  @ApiPropertyOptional() @IsString() @IsOptional() lawyerId?: string;
}

export class QuestionQueryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() region?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() language?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() countryId?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() q?: string;
  @ApiPropertyOptional() @IsOptional() page?: number;
  @ApiPropertyOptional() @IsOptional() limit?: number;
}
