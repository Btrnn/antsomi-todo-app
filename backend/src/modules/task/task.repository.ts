// Etities
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity';

export class TaskRepository extends Repository<TaskEntity> {
  async getList() {
    const entities = await this.find();

    return entities;
  }
}
