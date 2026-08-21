import { IsString, IsNumber, IsOptional, IsBoolean, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty() @IsString() lawyerId: string;
  @ApiProperty() @IsString() titleUz: string;
  @ApiProperty() @IsString() titleRu: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleEn?: string;
  @ApiProperty() @IsString() descriptionUz: string;
  @ApiProperty() @IsString() descriptionRu: string;
  @ApiPropertyOptional() @IsString() @IsOptional() descriptionEn?: string;
  @ApiProperty() @IsNumber() @Min(0) price: number;
  @ApiPropertyOptional({ default: 'UZS' }) @IsString() @IsOptional() currency?: string;
  @ApiProperty() @IsNumber() @Min(1) deliveryDays: number;
  @ApiProperty() @IsString() category: string;
}

export class UpdateServiceDto {
  @ApiPropertyOptional() @IsString() @IsOptional() titleUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() titleEn?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() descriptionUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() descriptionRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() descriptionEn?: string;
  @ApiPropertyOptional() @IsNumber() @Min(0) @IsOptional() price?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() currency?: string;
  @ApiPropertyOptional() @IsNumber() @Min(1) @IsOptional() deliveryDays?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() category?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isActive?: boolean;
}
