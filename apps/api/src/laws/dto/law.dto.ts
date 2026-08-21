import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLawDto {
  @ApiPropertyOptional() @IsString() titleUz: string;
  @ApiPropertyOptional() @IsString() titleRu: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleEn?: string;
  @ApiPropertyOptional() @IsString() slug: string;
  @ApiPropertyOptional() @IsString() fullTextUz: string;
  @ApiPropertyOptional() @IsString() fullTextRu: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fullTextEn?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() summaryUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() summaryRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() summaryEn?: string;
  @ApiPropertyOptional({ enum: ['CONSTITUTION', 'CODE', 'LAW', 'DECREE', 'REGULATION'] })
  @IsEnum(['CONSTITUTION', 'CODE', 'LAW', 'DECREE', 'REGULATION'])
  type: string;
  @ApiPropertyOptional() @IsString() category: string;
  @ApiPropertyOptional({ enum: ['IN_FORCE', 'AMENDED', 'REPEALED', 'DRAFT'] })
  @IsOptional()
  @IsEnum(['IN_FORCE', 'AMENDED', 'REPEALED', 'DRAFT'])
  status?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() adoptionDate?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() effectiveDate?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() sourceUrl?: string;
  @ApiPropertyOptional() @IsString() countryId: string;
}

export class UpdateLawDto {
  @ApiPropertyOptional() @IsString() @IsOptional() titleUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleEn?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fullTextUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fullTextRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() fullTextEn?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() summaryUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() summaryRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() summaryEn?: string;
  @ApiPropertyOptional({ enum: ['IN_FORCE', 'AMENDED', 'REPEALED', 'DRAFT'] })
  @IsOptional()
  @IsEnum(['IN_FORCE', 'AMENDED', 'REPEALED', 'DRAFT'])
  status?: string;
  @ApiPropertyOptional() @IsDateString() @IsOptional() adoptionDate?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() sourceUrl?: string;
}

export class LawQueryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() q?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional({ enum: ['CONSTITUTION', 'CODE', 'LAW', 'DECREE', 'REGULATION'] })
  @IsOptional()
  @IsEnum(['CONSTITUTION', 'CODE', 'LAW', 'DECREE', 'REGULATION'])
  type?: string;
  @ApiPropertyOptional({ enum: ['IN_FORCE', 'AMENDED', 'REPEALED', 'DRAFT'] })
  @IsOptional()
  @IsEnum(['IN_FORCE', 'AMENDED', 'REPEALED', 'DRAFT'])
  status?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() countryId?: string;
  @ApiPropertyOptional() @IsOptional() page?: number;
  @ApiPropertyOptional() @IsOptional() limit?: number;
}
