// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Services
import { NotificationService } from './notification.service';

// Entities
import { NotificationEntity } from './notification.entity';

// Modules
import { AuthModule } from '../auth/auth.module';

// Controllers
import { NotificationController } from './notification.controller';

// Repositories
import { NotificationRepository } from './notification.repository';

// Gateways
import { NotificationGateway } from './notification.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), AuthModule],
  controllers: [NotificationController],
  providers: [
    TypeOrmModule,
    NotificationService,
    NotificationRepository,
    NotificationGateway,
  ],
})
export class NotificationModule {}
