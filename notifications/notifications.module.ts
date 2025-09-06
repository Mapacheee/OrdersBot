import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { notificationsController } from './notificatios.controller';

@Module({
  controllers: [notificationsController],
  providers: [NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
