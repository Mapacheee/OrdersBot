import { Injectable } from '@nestjs/common';
import { Order } from '../orders/entities/order.entity';

@Injectable()
export class NotificationsService {
  async notifyNewOrder(order: Order): Promise<void> {
    console.log(`Nueva orden recibida #${order.id} de ${order.customerName}`);
    console.log(`Teléfono: ${order.customerPhone}`);
    console.log(`Total: $${order.totalAmount}`);
  }

  async notifyOrderStatusChange(order: Order): Promise<void> {
    console.log(`Orden #${order.id} cambió a estado: ${order.status}`);
    console.log(`Cliente: ${order.customerName} (${order.customerPhone})`);
  }

  async notifyLowStock(productName: string, currentStock: number): Promise<void> {
    console.log(`Stock bajo: ${productName} - Quedan ${currentStock} unidades`);
  }
}
