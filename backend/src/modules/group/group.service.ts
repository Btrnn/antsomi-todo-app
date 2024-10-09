// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
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

  async findAll(userID: IdentifyId): Promise<ServiceResponse<GroupEntity[]>> {
    const entities = await this.groupRepository.find({
      where: {
        owner_id: userID as string,
      },
      order: {
        position: {
          direction: 'ASC',
        },
      },
    });
    return { data: entities, meta: { page: 1 } };
  }

  // async findOne(id: IdentifyId): Promise<ServiceResponse<GroupEntity>> {
  //   const entity = await this.groupRepository.findOneBy({ id: id as string });
  //   return { data: entity, meta: {} };
  // }

  async createGroup(
    group: Omit<GroupEntity, 'id'>,
  ): Promise<ServiceResponse<GroupEntity>> {
    const entity = await this.groupRepository
      .createQueryBuilder()
      .insert()
      .into(GroupEntity)
      .values(group)
      .returning('*')
      .execute();
    return { data: entity.raw, meta: {} };
  }

  async deleteGroup(
    id: IdentifyId,
    userID: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    const currentGroup = await this.groupRepository.findOneBy({
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

    await this.dataSource.transaction(async (manager) => {
      const result = await manager.delete(GroupEntity, { id });
      await manager.delete(TaskEntity, { status_id: id });
      return { data: result.affected > 0, meta: {} };
    });
    return { data: false, meta: {} };
  }

  async updateGroup(
    id: IdentifyId,
    updateData: Partial<GroupEntity>,
    userID: IdentifyId,
  ): Promise<ServiceResponse<GroupEntity>> {
    const currentGroup = await this.groupRepository.findOneBy({
      id: id as string,
    });

    if (currentGroup.owner_id !== (userID as string)) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          statusMessage:
            'Update failed: You do not have permission to perform this action.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    const result = await this.groupRepository
      .createQueryBuilder()
      .update(GroupEntity)
      .set(updateData)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return { data: result.raw, meta: {} };
  }

  async reorderGroup(
    groupsPosition: { id: string; position: number }[],
  ): Promise<ServiceResponse<boolean>> {
    for (const { id, position } of groupsPosition) {
      await this.groupRepository.update({ id }, { position });
    }
    return { data: true, meta: {} };
  }
}
