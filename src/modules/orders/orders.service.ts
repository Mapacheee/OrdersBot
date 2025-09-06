import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { ProductsService } from '../products/products.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly productsService: ProductsService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(createOrderDto: CreateOrderDto): Promise<Order> {
    const order = this.orderRepository.create({
      customerName: createOrderDto.customerName,
      customerPhone: createOrderDto.customerPhone,
      paymentMethod: createOrderDto.paymentMethod,
      notes: createOrderDto.notes,
      totalAmount: 0,
    });

    const savedOrder = await this.orderRepository.save(order);

    let totalAmount = 0;
    const orderItems: OrderItem[] = [];

    for (const itemDto of createOrderDto.items) {
      const product = await this.productsService.findOne(itemDto.productId);
      if (!product) {
        throw new NotFoundException(`product with ID ${itemDto.productId} not found`);
      }

      const orderItem = this.orderItemRepository.create({
        order: savedOrder,
        product,
        quantity: itemDto.quantity,
        unitPrice: product.price,
        totalPrice: product.price * itemDto.quantity,
      });

      orderItems.push(orderItem);
      totalAmount += orderItem.totalPrice;

      await this.productsService.updateStock(product.id, itemDto.quantity);
    }

    await this.orderItemRepository.save(orderItems);

    savedOrder.totalAmount = totalAmount;
    savedOrder.items = orderItems;

    const finalOrder = await this.orderRepository.save(savedOrder);

    await this.notificationsService.notifyNewOrder(finalOrder);

    return finalOrder;
  }

  async findAll(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Order | null> {
    return await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product'],
    });
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    if (!order) {
      throw new NotFoundException(`order with ID ${id} not found`);
    }

    order.status = updateOrderStatusDto.status;
    const updatedOrder = await this.orderRepository.save(order);

    await this.notificationsService.notifyOrderStatusChange(updatedOrder);

    return updatedOrder;
  }

  async findByPhone(phone: string): Promise<Order[]> {
    return await this.orderRepository.find({
      where: { customerPhone: phone },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }

  async getTodayOrders(): Promise<Order[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await this.orderRepository.find({
      where: {
        createdAt: {
          gte: today,
          lt: tomorrow,
        } as any,
      },
      relations: ['items', 'items.product'],
      order: { createdAt: 'DESC' },
    });
  }
}
