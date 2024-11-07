// Libraries
import { Injectable } from '@nestjs/common';
import { DataSource, DeleteResult } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Entities
import { GroupEntity } from './group.entity';
import { TaskEntity } from '../task/task.entity';

// Repository
import { GroupRepository } from './group.repository';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: GroupRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(boardID: IdentifyId): Promise<ServiceResponse<GroupEntity[]>> {
    const entities = await this.groupRepository.find({
      where: {
        board_id: boardID as string,
      },
      order: {
        position: {
          direction: 'ASC',
        },
      },
    });
    return { data: entities ? entities : [], meta: { page: 1 } };
  }

  async createGroup(
    group: Omit<GroupEntity, 'id'>,
  ): Promise<ServiceResponse<GroupEntity>> {
    const entity = await this.groupRepository.save(group);
    return { data: entity ? entity : null, meta: {} };
  }

  async deleteGroup(id: IdentifyId): Promise<ServiceResponse<boolean>> {
    let result = { raw: [], affected: 0 } as DeleteResult;
    await this.dataSource.transaction(async (manager) => {
      result = await manager.delete(GroupEntity, { id });
      await manager.delete(TaskEntity, { status_id: id });
    });

    return { data: result.affected > 0, meta: {} };
  }

  async updateGroup(
    id: IdentifyId,
    updateData: Partial<GroupEntity>,
  ): Promise<ServiceResponse<boolean>> {
    const result = await this.groupRepository.update(
      { id: id as string },
      updateData,
    );

    return { data: result.affected > 0, meta: {} };
  }

  async reorderGroup(
    groupsPosition: { id: string; position: number }[],
  ): Promise<ServiceResponse<boolean>> {
    let allUpdated = true;
    for (const { id, position } of groupsPosition) {
      const result = await this.groupRepository.update({ id }, { position });
      if (result.affected === 0) {
        allUpdated = false;
      }
    }
    return { data: allUpdated, meta: {} };
  }
}
