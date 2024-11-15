// Libraries
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Entities
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

  async findAll(boardID: IdentifyId): Promise<ServiceResponse<TaskEntity[]>> {
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
      data: entity ? entity : null,
      meta: {},
    };
  }

  async deleteTask(id: IdentifyId): Promise<ServiceResponse<boolean>> {
    const result = await this.taskRepository.delete(id);
    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async deleteTaskByGroupID(id: IdentifyId): Promise<ServiceResponse<boolean>> {
    const result = await this.taskRepository.delete({
      status_id: id as string,
    });
    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async updateTask(
    id: IdentifyId,
    updateData: Partial<TaskEntity>,
  ): Promise<ServiceResponse<boolean>> {
    const result = await this.taskRepository.update(
      { id: id as string },
      updateData,
    );

    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async addAttachments(
    id: IdentifyId,
    attachment: {
      filename: string;
      path: string;
      size: number;
      mimetype: string;
    },
  ): Promise<
    ServiceResponse<{
      filename: string;
      path: string;
      size: number;
      mimetype: string;
    }>
  > {
    const currentTask = await this.taskRepository.findOneBy({
      id: id as string,
    });

    if (currentTask.attachments) {
      //currentTask.attachments = [];
      currentTask.attachments.push(attachment);
    } else {
      currentTask.attachments = [attachment];
    }

    const result = await this.taskRepository.update(
      { id: id as string },
      { attachments: currentTask.attachments },
    );

    return {
      data: attachment,
      meta: {},
    };
  }

  async deleteAttachments(
    id: IdentifyId,
    path: string,
  ): Promise<ServiceResponse<boolean>> {
    const currentTask = await this.taskRepository.findOneBy({
      id: id as string,
    });

    if (!currentTask.attachments) {
      return {
        data: false,
        meta: {},
      };
    }

    const newAttachments = currentTask.attachments.filter(
      (attachment) => attachment.path !== path,
    );

    const result = await this.taskRepository.update(
      { id: id as string },
      { attachments: newAttachments },
    );

    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async reorderTask(
    tasksPosition: { id: string; position: number }[],
  ): Promise<ServiceResponse<boolean>> {
    let allUpdated = true;
    for (const { id, position } of tasksPosition) {
      const result = await this.taskRepository.update({ id }, { position });
      if (result.affected === 0) {
        allUpdated = false;
        break;
      }
    }
    return {
      data: allUpdated,
      meta: {},
    };
  }
}
