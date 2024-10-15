// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Models
import { TaskEntity } from './task.entity';
import { GroupEntity } from '../group/group.entity';

// Repositories
import { TaskRepository } from './task.repository';

// Services
import { AuthService } from '../auth/auth.service';
import { PERMISSION } from '@app/constants';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(TaskEntity)
    private readonly taskRepository: TaskRepository,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
  ) {}
  async findAll(
    userID: IdentifyId,
    boardID: IdentifyId,
  ): Promise<ServiceResponse<TaskEntity[]>> {
    const groupList = await this.dataSource.manager.find(GroupEntity, {
      where: {
        board_id: boardID as string,
      },
    });

    const groupIDs = groupList.map((group) => group.id);
    if (groupIDs.length === 0) {
      return {
        data: [],
        meta: { page: 1 },
      };
    }

    const entities = await this.taskRepository.find({
      where: {
        status_id: In(groupIDs),
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
    boardID: IdentifyId,
    id: IdentifyId,
    userID: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    const checkAuthor = await this.authService.isAcceptedPermission(
      userID as string,
      boardID as string,
      PERMISSION.MANAGE,
    );
    if (!checkAuthor.data) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          statusMessage:
            'Action failed: You do not have permission to perform this action.',
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

  async deleteTaskByGroupID(id: IdentifyId): Promise<ServiceResponse<boolean>> {
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
  ): Promise<ServiceResponse<TaskEntity>> {
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
      id: tasksPosition[0].id,
    });

    // if (currentTask.owner_id !== (userId as string)) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.FORBIDDEN,
    //       statusMessage:
    //         'Update failed: You do not have permission to perform this action.',
    //     },
    //     HttpStatus.FORBIDDEN,
    //   );
    // }
    for (const { id, position } of tasksPosition) {
      await this.taskRepository.update({ id }, { position });
    }
    return {
      data: true,
      meta: {},
    };
  }
}
