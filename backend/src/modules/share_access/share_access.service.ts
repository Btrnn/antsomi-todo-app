// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { IdentifyId, ServiceResponse } from '@app/types';

// Constants
import { OBJECT_ENTITY, OBJECT_TYPE, PERMISSION, ROLE } from '@app/constants';

// Entities
import { AccessEntity } from './share_access.entity';

// Repositories
import { AccessRepository } from './share_access.repository';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(AccessEntity)
    private readonly accessRepository: AccessRepository,
    private readonly dataSource: DataSource,
  ) {}

  async createAccess(
    objectID: IdentifyId,
    user_permission: { user_id: IdentifyId; permission: string }[],
    userID: IdentifyId,
    objectType: string,
  ): Promise<ServiceResponse<boolean>> {
    const currentObject = await this.dataSource.manager.findOne<any>(
      `${OBJECT_ENTITY[objectType]}Entity`,
      {
        where: {
          id: objectID as string,
        },
      },
    );

    let current_permission;
    if (currentObject.owner_id === userID) {
      current_permission = ROLE.OWNER;
    } else {
      current_permission = await this.accessRepository.findOne({
        where: {
          user_id: userID as string,
          object_id: objectID as string,
        },
      });
      current_permission = current_permission.permission;
    }

    let result = true;
    for (const permission of user_permission) {
      const existAccess = await this.accessRepository.findOneBy({
        object_id: objectID as string,
        user_id: permission.user_id as string,
      });
      if (existAccess) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            statusMessage: 'This user already has access of the object',
          },
          HttpStatus.CONFLICT,
        );
      }
      if (currentObject.owner_id === permission.user_id) {
        throw new HttpException(
          {
            statusCode: HttpStatus.CONFLICT,
            statusMessage: 'Cannot share board with owner',
          },
          HttpStatus.CONFLICT,
        );
      }
      if (!PERMISSION[permission.permission].includes(current_permission)) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            statusMessage: 'Cannot share access with higher permission',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }

      const entity = await this.accessRepository.save({
        object_id: objectID as string,
        user_id: permission.user_id as string,
        permission: permission.permission,
        object_type: objectType,
      });
      if (!entity) {
        result = false;
      }
    }

    return { data: result, meta: {} };
  }

  async deleteAccess(
    objectID: IdentifyId,
    userID: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    const result = await this.accessRepository.delete({
      object_id: objectID as string,
      user_id: userID as string,
    });
    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async findObjectsByUser(
    userID: IdentifyId,
    objectType: string,
  ): Promise<ServiceResponse<string[]>> {
    const entities = await this.accessRepository.find({
      select: ['object_id'],
      where: { user_id: userID as string, object_type: objectType },
    });
    if (!entities) {
      return { data: [], meta: {} };
    }
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
    return { data: entity ? entity.permission : null, meta: {} };
  }

  async findPermission(
    userID: IdentifyId,
    objectID: IdentifyId,
    objectType: string,
  ): Promise<ServiceResponse<string>> {
    const currentObject = await this.dataSource.manager.findOne<any>(
      `${OBJECT_ENTITY[objectType]}Entity`,
      {
        where: {
          id: objectID as string,
        },
      },
    );

    if (currentObject.owner_id === (userID as string)) {
      return { data: ROLE.OWNER, meta: {} };
    }
    const result = await this.accessRepository.findOne({
      where: {
        user_id: userID as string,
        object_id: objectID as string,
      },
    });
    if (!result) {
      return { data: null, meta: {} };
    }
    return { data: result.permission, meta: {} };
  }

  async findUserAccessList(
    objectID: IdentifyId,
    objectType: string,
  ): Promise<
    ServiceResponse<
      { id: string; name: string; email: string; permission: string }[]
    >
  > {
    const currentObject = await this.dataSource.manager.findOne<any>(
      `${OBJECT_ENTITY[objectType]}Entity`,
      {
        where: {
          id: objectID as string,
        },
      },
    );

    if (!currentObject) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          statusMessage: 'Cannot find this object',
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const object_owner = await this.dataSource.manager.findOneBy(UserEntity, {
      id: currentObject.owner_id,
    });

    if (!object_owner) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          statusMessage: "Cannot find object's owner",
        },
        HttpStatus.NOT_FOUND,
      );
    }

    const entities = await this.accessRepository.find({
      select: ['user_id', 'permission'],
      where: { object_id: objectID as string, object_type: objectType },
    });

    let userAccessList;

    if (!entities) {
      userAccessList = [];
    } else {
      userAccessList = entities.map((entity) => ({
        id: entity.user_id,
        permission: entity.permission,
      }));
    }

    const userIDs = userAccessList.map((user) => user.id);
    let users = [];
    if (userIDs.length !== 0) {
      users = await this.dataSource.manager.find(UserEntity, {
        where: {
          id: In(userIDs),
        },
      });
    }
    const userDetails = users.map((user) => {
      const permission = userAccessList.find(
        (u) => u.id === user.id,
      )?.permission;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        permission: permission,
      };
    });

    userDetails.unshift({
      id: object_owner.id,
      name: object_owner.name,
      email: object_owner.email,
      permission: ROLE.OWNER,
    });

    return { data: userDetails, meta: {} };
  }

  async updateAccess(
    objectID: IdentifyId,
    accessList: { user_id: IdentifyId; permission: string }[],
    userID: IdentifyId,
    objectType: string,
  ): Promise<ServiceResponse<boolean>> {
    let current_permission,
      result = true;
    const currentObject = await this.dataSource.manager.findOne<any>(
      `${OBJECT_ENTITY[objectType]}Entity`,
      {
        where: {
          id: objectID as string,
        },
      },
    );

    if (userID === currentObject.owner_id) {
      current_permission = ROLE.OWNER;
    } else {
      current_permission = await this.accessRepository.findOne({
        where: {
          user_id: userID as string,
          object_id: objectID as string,
        },
      });
      current_permission = current_permission.permission;
    }

    for (const { user_id, permission } of accessList) {
      const existAccess = await this.accessRepository.findOneBy({
        object_id: objectID as string,
        user_id: user_id as string,
      });
      if (!existAccess) {
        throw new HttpException(
          {
            statusCode: HttpStatus.NOT_FOUND,
            statusMessage: 'Cannot find this access',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      if (currentObject.owner_id === user_id) {
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

      const entity = await this.accessRepository.update(
        {
          user_id: user_id as string,
          object_id: objectID as string,
        },
        { permission },
      );

      if (entity.affected === 0) {
        result = false;
      }
    }
    return { data: result, meta: {} };
  }

  async changeOwner(
    objectID: IdentifyId,
    new_owner_id: IdentifyId,
    current_owner_id: IdentifyId,
    objectType: string,
  ): Promise<ServiceResponse<boolean>> {
    const entity = await this.dataSource.manager.update(
      `${OBJECT_ENTITY[objectType]}Entity`,
      { id: objectID as string },
      { owner_id: new_owner_id as string },
    );

    if (entity.affected !== 0) {
      await this.deleteAccess(objectID, new_owner_id);
      await this.createAccess(
        objectID,
        [
          {
            user_id: current_owner_id,
            permission: ROLE.EDITOR,
          },
        ],
        new_owner_id,
        objectType,
      );
    }
    return { data: entity.affected > 0, meta: {} };
  }
}
