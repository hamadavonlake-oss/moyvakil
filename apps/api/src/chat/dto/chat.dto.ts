import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateConversationDto {
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @IsString()
  @IsOptional()
  language?: string = 'uz';
}

export class SendMessageDto {
  @IsString()
  @IsNotEmpty()
  content: string;
}
