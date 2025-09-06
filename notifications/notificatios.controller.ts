//aqui se enviara el mensaje al negocio
import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices'; //instalar paquete microservicios
import { ConfigService } from '@nestjs/config'; //variables de entorno
import { NotificationsService } from './notifications.service';

@Controller()
export class notificationsController {
    private BUSINESS_PHONE: string;

    constructor(
        private readonly notificacionsApiService: NotificationsService,
        private readonly configService: ConfigService, // Inyectamos el servicio de configuración
    ) {
        // Obtenemos el número del dueño desde las variables de entorno
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.BUSINESS_PHONE = this.configService.get<string>('BUSINESS_PHONE') || '';
    }

    @EventPattern('order.created')
    async handleOrderCreated(@Payload() data: any) {
        // 1. Formatear el mensaje del pedido
        const messageForOwner = `
      🔔 *¡Nuevo Pedido! #${data?.orderId ?? ''}* 🔔

      *Cliente:* ${data?.customerName ?? ''}
      *Total:* $${data?.total ? data.total.toLocaleString('es-CL') : ''}

      *Detalle:*
      ${data.items.map((item: { quantity: any; name: any }) => `- ${item.quantity}x ${item.name}`).join('\n')}
    `;

// se envia al mismo numero
        await this.notificacionsApiService.sendMessage(
            this.BUSINESS_PHONE,
            messageForOwner,
        );

        // (Opcional) Enviar también un mensaje de confirmación al cliente
        await this.notificacionsApiService.sendMessage(
            data.customerPhone,
            '¡Recibimos tu pedido! Ya estamos preparando todo.',
        );
    }
}
