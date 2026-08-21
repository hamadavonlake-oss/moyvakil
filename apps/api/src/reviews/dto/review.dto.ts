import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty() @IsString() lawyerId: string;
  @ApiProperty() @IsString() authorName: string;
  @ApiProperty() @IsNumber() @Min(1) @Max(5) rating: number;
  @ApiPropertyOptional() @IsString() @IsOptional() title?: string;
  @ApiProperty() @IsString() content: string;
}

export class ModerateReviewDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsString()
  status: 'APPROVED' | 'REJECTED';
}
