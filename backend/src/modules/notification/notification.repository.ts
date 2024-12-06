// Libraries
import { Repository } from 'typeorm';

// Entities
import { NotificationEntity } from './notification.entity';

export class NotificationRepository extends Repository<NotificationEntity> {
  async getList() {
    const entities = await this.find();
    return entities;
  }
}