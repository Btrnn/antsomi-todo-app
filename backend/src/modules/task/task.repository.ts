// Etities
import { Repository } from 'typeorm';
import { TaskEntity } from './task.entity';

export class TaskRepository extends Repository<TaskEntity> {
  //   async createTask(
  //     name: string,
  //     position: number,
  //     type: string,
  //     color: string,
  //   ): Promise<Task> {
  //     const group = this.create({ name, position, type, color });
  //     return group;
  //   }

  async getList() {
    const entities = await this.find();

    return entities;
  }
}
