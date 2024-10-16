import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AccessEntity } from './share_access.entity';
import { AccessRepository } from './share_access.repository';
import { IdentifyId, ServiceResponse } from '@app/types';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(AccessEntity)
    private readonly accessRepository: AccessRepository,
  ) {}

  async createAccess(
    access: Omit<AccessEntity, 'created_at'>,
  ): Promise<ServiceResponse<AccessEntity>> {
    const entity = await this.accessRepository
      .createQueryBuilder()
      .insert()
      .into(AccessEntity)
      .values(access)
      .returning('*')
      .execute();
    return { data: entity.raw, meta: {} };
  }

  async updateAccess(
    object_id: IdentifyId,
    object_type: string,
    accessList: { user_id: IdentifyId; permission: string }[],
  ): Promise<ServiceResponse<boolean>> {
    for (const { user_id, permission } of accessList) {
      await this.accessRepository.update(
        {
          user_id: user_id as string,
          object_id: object_id as string,
          object_type: object_type,
        },
        { permission },
      );
    }
    return { data: true, meta: {} };
  }

  async deleteAccess(
    objectID: IdentifyId,
    userID: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    const result = await this.accessRepository
      .createQueryBuilder()
      .delete()
      .from(AccessEntity)
      .where('object_id = :objectID', { objectID })
      .andWhere('user_id = :userID', { userID })
      .execute();
    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async findBoardsByUser(
    userID: IdentifyId,
  ): Promise<ServiceResponse<string[]>> {
    const entities = await this.accessRepository.find({
      select: ['object_id'],
      where: { user_id: userID as string },
    });
    const boardIDs = entities.map((entity) => entity.object_id);
    return { data: boardIDs, meta: {} };
  }

  async findUserPermission(
    userID: IdentifyId,
    objectID: IdentifyId,
  ): Promise<ServiceResponse<string>> {
    const entity = await this.accessRepository.findOne({
      where: {
        user_id: userID as string,
        object_id: objectID as string,
      },
    });
    return { data: entity.permission, meta: {} };
  }

  async findUserAccessListByObjectId(
    objectID: IdentifyId,
    objectType: string,
  ): Promise<ServiceResponse<{ id: IdentifyId; permission: string }[]>> {
    const entities = await this.accessRepository.find({
      select: ['user_id', 'permission'],
      where: { object_id: objectID as string, object_type: objectType },
    });
    const userList = entities.map((entity) => ({
      id: entity.user_id,
      permission: entity.permission,
    }));
    return { data: userList, meta: {} };
  }
}
