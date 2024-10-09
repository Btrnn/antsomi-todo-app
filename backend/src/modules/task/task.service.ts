// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Models
import { TaskEntity } from './task.entity';
import { GroupEntity } from '../group/group.entity';

// Repositories
import { TaskRepository } from './task.repository';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: TaskRepository,
    private readonly dataSource: DataSource,
  ) {}
  async findAll(userID: IdentifyId): Promise<ServiceResponse<TaskEntity[]>> {
    const entities = await this.taskRepository.find({
      where: {
        owner_id: userID as string,
      },
      order: {
        position: {
          direction: 'ASC',
        },
      },
    });
    return {
      data: entities,
      meta: { page: 1 },
    };
  }

  async createTask(
    task: Omit<TaskEntity, 'id'>,
  ): Promise<ServiceResponse<TaskEntity>> {
    const entity = await this.taskRepository.save(task);
    return {
      data: entity,
      meta: {},
    };
  }

  async deleteTask(
    id: IdentifyId,
    userID: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    const currentTask = await this.taskRepository.findOneBy({
      id: id as string,
    });

    if (currentTask.owner_id !== (userID as string)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          statusMessage:
            'Deletion failed: You do not have permission to perform this action.',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const result = await this.taskRepository
      .createQueryBuilder()
      .delete()
      .from(TaskEntity)
      .where('id = :id', { id })
      .execute();
    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async deleteTaskByGroupID(
    id: IdentifyId,
    userID: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    const currentGroup = await this.dataSource.manager.findOneBy(GroupEntity, {
      id: id as string,
    });

    if (currentGroup.owner_id !== (userID as string)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          statusMessage:
            'Deletion failed: You do not have permission to perform this action.',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const result = await this.taskRepository
      .createQueryBuilder()
      .delete()
      .from(TaskEntity)
      .where('status_id = :id', { id })
      .execute();
    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async updateTask(
    id: IdentifyId,
    updateData: Partial<TaskEntity>,
    userID: IdentifyId,
  ): Promise<ServiceResponse<TaskEntity>> {
    const currentTask = await this.taskRepository.findOneBy({
      id: id as string,
    });

    if (currentTask.owner_id !== (userID as string)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          statusMessage:
            'Update failed: You do not have permission to perform this action.',
        },
        HttpStatus.FORBIDDEN,
      );
    }

    const result = await this.taskRepository
      .createQueryBuilder()
      .update(TaskEntity)
      .set(updateData)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return {
      data: result.raw,
      meta: {},
    };
  }

  async reorderTask(
    tasksPosition: { id: string; position: number }[],
    userId: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    const currentTask = await this.taskRepository.findOneBy({
      id: tasksPosition[0].id as string,
    });

    if (currentTask.owner_id !== (userId as string)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          statusMessage:
            'Update failed: You do not have permission to perform this action.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    for (const { id, position } of tasksPosition) {
      await this.taskRepository.update({ id }, { position });
    }
    return {
      data: true,
      meta: {},
    };
  }
}
