import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsIn,
  IsDateString,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/swagger';

export const DOCUMENT_STATUSES = [
  'current',
  'amended',
  'repealed',
  'draft',
  'future_effective',
] as const;

export const SECTION_TYPES = [
  'chapter',
  'article',
  'paragraph',
  'subparagraph',
  'section',
  'definition',
  'tbl',
  'annex',
  'footnote',
] as const;

export class LegalDocumentQueryDto {
  @ApiPropertyOptional({ description: 'Free-text search on title' })
  @IsString()
  @IsOptional()
  q?: string;

  @ApiPropertyOptional({ description: 'Filter by country id' })
  @IsString()
  @IsOptional()
  countryId?: string;

  @ApiPropertyOptional({ description: 'Filter by document type' })
  @IsString()
  @IsOptional()
  documentType?: string;

  @ApiPropertyOptional({ enum: DOCUMENT_STATUSES })
  @IsOptional()
  @IsIn(DOCUMENT_STATUSES)
  status?: string;

  @ApiPropertyOptional({ description: 'Filter by language code, e.g. uz, ru' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 20;
}

export class SectionQueryDto {
  @ApiPropertyOptional({ enum: SECTION_TYPES })
  @IsOptional()
  @IsIn(SECTION_TYPES)
  sectionType?: string;

  @ApiPropertyOptional({ description: 'Filter by legal version id' })
  @IsString()
  @IsOptional()
  versionId?: string;

  @ApiPropertyOptional({ description: 'Filter by language code' })
  @IsString()
  @IsOptional()
  language?: string;

  @ApiPropertyOptional({ default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 50;
}

export class CreateLegalDocumentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  sourceId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  countryId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  jurisdictionId?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'law' })
  @IsString()
  @IsNotEmpty()
  documentType: string;

  @ApiPropertyOptional({ enum: DOCUMENT_STATUSES, default: 'current' })
  @IsOptional()
  @IsIn(DOCUMENT_STATUSES)
  status?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @ApiPropertyOptional({ format: 'date-time' })
  @IsDateString()
  @IsOptional()
  effectiveTo?: string;

  @ApiPropertyOptional({ default: 'uz' })
  @IsString()
  @IsOptional()
  languageCode?: string;
}

export class UpdateLegalDocumentDto extends PartialType(CreateLegalDocumentDto) {}
