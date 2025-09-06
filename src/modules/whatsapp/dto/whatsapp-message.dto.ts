import { IsString } from 'class-validator';

export class WhatsAppMessageDto {
  @IsString()
  from: string;

  @IsString()
  message: string;

  @IsString()
  messageId: string;
}
