// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IdentifyId, ServiceResponse } from '@app/types';

// Constants
import { OBJECT_TYPE, PERMISSION, ROLE } from '@app/constants';

// Entities
import { AccessEntity } from './share_access.entity';

// Repositories
import { AccessRepository } from './share_access.repository';
import { BoardEntity } from '../board/board.entity';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(AccessEntity)
    private readonly accessRepository: AccessRepository,
    private readonly dataSource: DataSource,
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
    access_list: { user_id: IdentifyId; permission: string }[],
    current_user: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    let current_permission, current_object;
    if (object_type === OBJECT_TYPE.BOARD) {
      current_object = await this.dataSource.manager.findOneBy(BoardEntity, {
        id: object_id as string,
      });
    }
    if (current_user === current_object.owner_id) {
      current_permission = ROLE.OWNER;
    } else {
      current_permission = await this.findUserPermission(
        current_user,
        object_id,
      );
      current_permission = current_permission.data;
    }

    for (const { user_id, permission } of access_list) {
      if (current_object.owner_id === user_id) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            statusMessage: 'Cannot share board with owner',
          },
          HttpStatus.CONFLICT,
        );
      }
      if (!PERMISSION[permission].includes(current_permission)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            statusMessage: 'Cannot share access with higher permission',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      await this.accessRepository.update(
        {
          user_id: user_id as string,
          object_id: object_id as string,
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
