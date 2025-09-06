import { Injectable } from '@nestjs/common';

interface MessageContext {
  from: string;
  message: string;
  customerName: string;
  customerPhone: string;
}

@Injectable()
export class AiService {
  async processMessage(context: MessageContext): Promise<string> {
    return `Hola ${context.customerName || 'cliente'}!` 
  }
}
