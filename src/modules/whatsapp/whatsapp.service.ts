import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import { AiService } from '../ai/ai.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
  private client: Client;

  constructor(
    private readonly aiService: AiService,
    private readonly ordersService: OrdersService,
    private readonly productsService: ProductsService,
  ) {
    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: process.env.WHATSAPP_SESSION_NAME || 'ordersbot-session',
      }),
      puppeteer: {
        headless: true,
      },
    });
  }

  async onModuleInit() {
    await this.initializeWhatsApp();
  }

  private async initializeWhatsApp() {
    this.client.on('qr', (qr) => {
      console.log('qr de wsp:');
      qrcode.generate(qr, { small: true });
    });

    this.client.on('ready', () => {
      console.log('bot de wsp listo');
    });

    this.client.on('message', async (message: Message) => {
      await this.handleMessage(message);
    });

    await this.client.initialize();
  }

  private async handleMessage(message: Message) {
    const contact = await message.getContact();
    const chatId = message.from;
    const messageBody = message.body.trim();

    if (message.fromMe) return;
    if (chatId.includes('@g.us')) return;

    console.log(`📱 Mensaje de ${contact.name || contact.number}: ${messageBody}`);

    try {
      const response = await this.aiService.processMessage({
        from: chatId,
        message: messageBody,
        customerName: contact.name || contact.number,
        customerPhone: contact.number,
      });

      await this.sendMessage(chatId, response);
    } catch (error) {
      console.error('error al procesar iamgen:', error);
      await this.sendMessage(
        chatId,
        'Lo siento, hubo un error procesando tu mensaje. Por favor intenta nuevamente.',
      );
    }
  }

  async sendMessage(chatId: string, message: string): Promise<void> {
    try {
      await this.client.sendMessage(chatId, message);
      console.log(`mensaje enviado a ${chatId}: ${message}`);
    } catch (error) {
      console.error('error enviando mensaje:', error);
    }
  }

  async notifyAdmin(message: string): Promise<void> {
    const adminPhone = process.env.BUSINESS_PHONE;
    if (adminPhone) {
      await this.sendMessage(`${adminPhone}@c.us`, `OrdersBot: ${message}`);
    }
  }

  async getClient(): Promise<Client> {
    return this.client;
  }
}
