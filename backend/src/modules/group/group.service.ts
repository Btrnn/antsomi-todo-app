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

// Constants
import { PERMISSION } from '@app/constants';

// Services
import { AuthService } from '../auth/auth.service';

@Injectable()
export class GroupService {
  constructor(
    @InjectRepository(GroupEntity)
    private readonly groupRepository: GroupRepository,
    private readonly dataSource: DataSource,
    private readonly authService: AuthService,
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
    return { data: entities, meta: { page: 1 } };
  }

  async createGroup(
    userID: IdentifyId,
    group: Omit<GroupEntity, 'id'>,
  ): Promise<ServiceResponse<GroupEntity>> {
    const entity = await this.groupRepository.save(group);
    // const entity = await this.groupRepository
    //   .createQueryBuilder()
    //   .insert()
    //   .into(GroupEntity)
    //   .values(group)
    //   .returning('*')
    //   .execute();
    return { data: entity, meta: {} };
  }

  async deleteGroup(id: IdentifyId): Promise<ServiceResponse<boolean>> {
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
  ): Promise<ServiceResponse<GroupEntity>> {
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
