import { IsString, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLawyerDto {
  @ApiPropertyOptional() @IsString() countryId: string;
  @ApiPropertyOptional() @IsString() firstName: string;
  @ApiPropertyOptional() @IsString() lastName: string;
  @ApiPropertyOptional() @IsString() slug: string;
  @ApiPropertyOptional() @IsString() @IsOptional() photoUrl?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() email?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() website?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() licenseNumber?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() yearsOfPractice?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() education?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bioUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bioRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bioEn?: string;
  @ApiPropertyOptional() @IsString() city: string;
  @ApiPropertyOptional() @IsString() @IsOptional() region?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() practiceAreas?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() languages?: string[];
}

export class UpdateLawyerDto {
  @ApiPropertyOptional() @IsString() @IsOptional() firstName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() lastName?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() photoUrl?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() phone?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() email?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() website?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() licenseNumber?: string;
  @ApiPropertyOptional() @IsNumber() @IsOptional() yearsOfPractice?: number;
  @ApiPropertyOptional() @IsString() @IsOptional() education?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bioUz?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bioRu?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() bioEn?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() city?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() region?: string;
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() practiceAreas?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsArray() @IsOptional() languages?: string[];
  @ApiPropertyOptional() @IsBoolean() @IsOptional() licenseVerified?: boolean;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() isVerified?: boolean;
}

export class LawyerQueryDto {
  @ApiPropertyOptional() @IsString() @IsOptional() q?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() city?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() practiceArea?: string;
  @ApiPropertyOptional() @IsString() @IsOptional() language?: string;
  @ApiPropertyOptional() @IsBoolean() @IsOptional() verified?: boolean;
  @ApiPropertyOptional() @IsString() @IsOptional() countryId?: string;
  @ApiPropertyOptional() @IsOptional() minRating?: number;
  @ApiPropertyOptional() @IsOptional() page?: number;
  @ApiPropertyOptional() @IsOptional() limit?: number;
}
