import { IsString, IsOptional, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGuideDto {
  @ApiProperty() @IsString() countryId: string;
  @ApiProperty() @IsString() titleUz: string;
  @ApiProperty() @IsString() titleRu: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleEn?: string;
  @ApiProperty() @IsString() slug: string;
  @ApiProperty() @IsString() bodyUz: string;
  @ApiProperty() @IsString() bodyRu: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bodyEn?: string;
  @ApiProperty() @IsString() category: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() tags?: string[];
  @ApiPropertyOptional() @IsString() @IsOptional() lawId?: string;
  @ApiPropertyOptional() @IsOptional() readingTime?: number;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() published?: boolean;
}

export class UpdateGuideDto {
  @ApiPropertyOptional() @IsString() @IsOptional() titleUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleEn?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bodyUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bodyRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bodyEn?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() tags?: string[];
  @ApiPropertyOptional() @IsBoolean() @IsOptional() published?: boolean;
}

export class GuideQueryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() q?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() countryId?: string;
  @ApiPropertyOptional() @IsOptional() page?: number;
  @ApiPropertyOptional() @IsOptional() limit?: number;
}
