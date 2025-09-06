import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module';
import { OrdersModule } from '../orders/orders.module';
import { ProductsModule } from '../products/products.module';
import { WhatsappService } from './whatsapp.service';

@Module({
  imports: [AiModule, OrdersModule, ProductsModule],
  providers: [WhatsappService],
  exports: [WhatsappService],
})
export class WhatsappModule {}
