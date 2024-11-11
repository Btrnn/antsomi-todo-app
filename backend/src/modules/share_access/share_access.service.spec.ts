import { Test, TestingModule } from '@nestjs/testing';
import { AccessService } from './share_access.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessEntity } from './share_access.entity';
import { DataSource, In } from 'typeorm';
import { ServiceResponse } from '@app/types';
import { OBJECT_ENTITY, ROLE } from '@app/constants';
import { HttpException } from '@nestjs/common';
import { mock } from 'node:test';
import { UserEntity } from '../user/user.entity';

describe('ShareAccessService', () => {
  let service: AccessService;
  let mockAccessRepository: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockAccessRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    mockDataSource = {
      manager: {
        find: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        findOneBy: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessService,
        {
          provide: getRepositoryToken(AccessEntity),
          useValue: mockAccessRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AccessService>(AccessService);
  });

  describe('createAccess', () => {
    const mockUserID = 'mock-user-ID';
    const mockObjectType = 'board';
    const mockObjectID = 'mock-object-ID';

    it('should return true if all accesses are created (creator is owner)', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: mockUserID,
      };

      const mockPermissions = Array.from({ length: 3 }, (_, i) => ({
        user_id: `mock-user-${i}`,
        permission: 'viewer',
      }));

      const mockCreateResult = Array.from({ length: 3 }, (_, i) => ({
        user_id: mockPermissions[i].user_id,
        permission: mockPermissions[i].permission,
        object_id: mockObjectID,
        object_type: mockObjectType,
      }));

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      // jest
      //   .spyOn(mockAccessRepository, 'save')
      //   .mockImplementation(() => mockUpdateResult);

      mockCreateResult.forEach((result) => {
        jest
          .spyOn(mockAccessRepository, 'save')
          .mockImplementationOnce(() => result);
      });

      jest
        .spyOn(mockAccessRepository, 'findOneBy')
        .mockImplementation(() => null);

      const result: ServiceResponse<boolean> = await service.createAccess(
        mockObjectID,
        mockPermissions,
        mockUserID,
        mockObjectType,
      );
      expect(result.data).toEqual(true);
      expect(mockAccessRepository.save).toHaveBeenCalledTimes(
        mockPermissions.length,
      );
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID as string,
          },
        },
      );
      for (const permission of mockPermissions) {
        expect(mockAccessRepository.findOneBy).toHaveBeenCalledWith({
          object_id: mockObjectID,
          user_id: permission.user_id,
        });
        expect(mockAccessRepository.save).toHaveBeenCalledWith({
          object_id: mockObjectID as string,
          user_id: permission.user_id,
          permission: permission.permission,
          object_type: mockObjectType,
        });
      }
      expect(mockAccessRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return true if all accesses are created (creator is not owner)', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = Array.from({ length: 3 }, (_, i) => ({
        user_id: `mock-user-${i}`,
        permission: 'viewer',
      }));

      const mockUserPermission = {
        permission: 'editor',
      };

      const mockCreateResult = Array.from({ length: 3 }, (_, i) => ({
        user_id: mockPermissions[i].user_id,
        permission: mockPermissions[i].permission,
        object_id: mockObjectID,
        object_type: mockObjectType,
      }));

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      mockCreateResult.forEach((result) => {
        jest
          .spyOn(mockAccessRepository, 'save')
          .mockImplementationOnce(() => result);
      });
      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      jest
        .spyOn(mockAccessRepository, 'findOneBy')
        .mockImplementation(() => null);

      const result: ServiceResponse<boolean> = await service.createAccess(
        mockObjectID,
        mockPermissions,
        mockUserID,
        mockObjectType,
      );
      expect(result.data).toEqual(true);
      expect(mockAccessRepository.save).toHaveBeenCalledTimes(
        mockPermissions.length,
      );
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      for (const permission of mockPermissions) {
        expect(mockAccessRepository.findOneBy).toHaveBeenCalledWith({
          object_id: mockObjectID,
          user_id: permission.user_id,
        });
        expect(mockAccessRepository.save).toHaveBeenCalledWith({
          object_id: mockObjectID as string,
          user_id: permission.user_id,
          permission: permission.permission,
          object_type: mockObjectType,
        });
      }
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
    });

    it('should throw a CONFLICT error if attempting to share the board with the owner', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = [
        {
          user_id: `mock-owner-ID`,
          permission: 'viewer',
        },
      ];

      const mockUserPermission = {
        permission: 'editor',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      jest
        .spyOn(mockAccessRepository, 'findOneBy')
        .mockImplementation(() => null);

      await expect(
        service.createAccess(
          mockObjectID,
          mockPermissions,
          mockUserID,
          mockObjectType,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
      expect(mockAccessRepository.save).not.toHaveBeenCalled();
    });

    it('should throw a CONFLICT error if attempting to share the already existed access', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = [
        {
          user_id: `mock-owner-ID`,
          permission: 'viewer',
        },
      ];

      const mockUserPermission = {
        permission: 'editor',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      jest
        .spyOn(mockAccessRepository, 'findOneBy')
        .mockImplementation(() => null);

      await expect(
        service.createAccess(
          mockObjectID,
          mockPermissions,
          mockUserID,
          mockObjectType,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
      expect(mockAccessRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an UNAUTHORIZED error if attempting to share access with a higher permission level', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = [
        {
          user_id: `mock-user-ID`,
          permission: 'editor',
        },
      ];

      const mockUserPermission = {
        permission: 'viewer',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      await expect(
        service.createAccess(
          mockObjectID,
          mockPermissions,
          mockUserID,
          mockObjectType,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
      expect(mockAccessRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteAccess', () => {
    const mockUserID = 'mock-user-ID';
    const mockObjectID = 'mock-object-ID';

    it('should return true if an access is deleted', async () => {
      const mockDeleteResult = {
        affected: 1,
      };
      jest
        .spyOn(mockAccessRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result = await service.deleteAccess(mockObjectID, mockUserID);

      expect(result.data).toEqual(true);
      expect(mockAccessRepository.delete).toHaveBeenCalledWith({
        object_id: mockObjectID,
        user_id: mockUserID,
      });
    });

    it('should return false if no accesses are deleted', async () => {
      const mockDeleteResult = {
        affected: 0,
      };
      jest
        .spyOn(mockAccessRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result = await service.deleteAccess(mockObjectID, mockUserID);

      expect(result.data).toEqual(false);
      expect(mockAccessRepository.delete).toHaveBeenCalledWith({
        object_id: mockObjectID,
        user_id: mockUserID,
      });
    });
  });

  describe('updateAccess', () => {
    const mockUserID = 'mock-user-ID';
    const mockObjectType = 'board';
    const mockObjectID = 'mock-object-ID';

    it('should return true if all accesses are updated (updater is owner)', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: mockUserID,
      };

      const mockPermissions = Array.from({ length: 3 }, (_, i) => ({
        user_id: `mock-user-${i}`,
        permission: 'editor',
      }));

      const mockExistAccess = Array.from({ length: 3 }, (_, i) => ({
        user_id: mockPermissions[i].user_id,
        permission: 'viewer',
      }));

      const mockUpdateResult = {
        affected: 1,
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      mockExistAccess.forEach((access) => {
        jest
          .spyOn(mockAccessRepository, 'findOneBy')
          .mockImplementationOnce(() => access);
      });

      const result: ServiceResponse<boolean> = await service.updateAccess(
        mockObjectID,
        mockPermissions,
        mockUserID,
        mockObjectType,
      );
      expect(result.data).toEqual(true);
      expect(mockAccessRepository.update).toHaveBeenCalledTimes(
        mockPermissions.length,
      );
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID as string,
          },
        },
      );
      for (const permission of mockPermissions) {
        expect(mockAccessRepository.findOneBy).toHaveBeenCalledWith({
          object_id: mockObjectID,
          user_id: permission.user_id,
        });
        expect(mockAccessRepository.update).toHaveBeenCalledWith(
          {
            user_id: permission.user_id as string,
            object_id: mockObjectID as string,
          },
          { permission: permission.permission },
        );
      }
      expect(mockAccessRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return true if all accesses are updated (updater is not owner)', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = Array.from({ length: 3 }, (_, i) => ({
        user_id: `mock-user-${i}`,
        permission: 'viewer',
      }));

      const mockUserPermission = {
        permission: 'editor',
      };

      const mockUpdateResult = {
        affected: 1,
      };

      const mockExistAccess = Array.from({ length: 3 }, (_, i) => ({
        user_id: mockPermissions[i].user_id,
        permission: 'viewer',
      }));

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      mockExistAccess.forEach((access) => {
        jest
          .spyOn(mockAccessRepository, 'findOneBy')
          .mockImplementationOnce(() => access);
      });

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      jest
        .spyOn(mockAccessRepository, 'findOneBy')
        .mockImplementation(() => null);

      const result: ServiceResponse<boolean> = await service.updateAccess(
        mockObjectID,
        mockPermissions,
        mockUserID,
        mockObjectType,
      );
      expect(result.data).toEqual(true);
      expect(mockAccessRepository.update).toHaveBeenCalledTimes(
        mockPermissions.length,
      );
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      for (const permission of mockPermissions) {
        expect(mockAccessRepository.findOneBy).toHaveBeenCalledWith({
          object_id: mockObjectID,
          user_id: permission.user_id,
        });
        expect(mockAccessRepository.update).toHaveBeenCalledWith(
          {
            user_id: permission.user_id as string,
            object_id: mockObjectID as string,
          },
          { permission: permission.permission },
        );
      }
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
    });

    it('should throw a CONFLICT error if attempting to update access of the owner', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = [
        {
          user_id: `mock-owner-ID`,
          permission: 'viewer',
        },
      ];

      const mockUserPermission = {
        permission: 'editor',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      jest
        .spyOn(mockAccessRepository, 'findOneBy')
        .mockImplementation(() => null);

      await expect(
        service.updateAccess(
          mockObjectID,
          mockPermissions,
          mockUserID,
          mockObjectType,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
      expect(mockAccessRepository.save).not.toHaveBeenCalled();
    });

    it('should throw a UNDEFINED error if attempting to update a non-existed access', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = [
        {
          user_id: `mock-owner-ID`,
          permission: 'viewer',
        },
      ];

      const mockUserPermission = {
        permission: 'editor',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      jest
        .spyOn(mockAccessRepository, 'findOneBy')
        .mockImplementation(() => null);

      await expect(
        service.updateAccess(
          mockObjectID,
          mockPermissions,
          mockUserID,
          mockObjectType,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
      expect(mockAccessRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an UNAUTHORIZED error if attempting to share access with a higher permission level', async () => {
      const mockObject = {
        id: 'mock-object-ID',
        owner_id: 'mock-owner-ID',
      };

      const mockPermissions = [
        {
          user_id: `mock-user-ID`,
          permission: 'editor',
        },
      ];

      const mockUserPermission = {
        permission: 'viewer',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockUserPermission);

      await expect(
        service.createAccess(
          mockObjectID,
          mockPermissions,
          mockUserID,
          mockObjectType,
        ),
      ).rejects.toThrow(HttpException);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
      expect(mockAccessRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findPermission', () => {
    const mockUserID = 'mock-user-ID';
    const mockObjectType = 'board';
    const mockObjectID = 'mock-object-ID';

    it('should return the permission as owner', async () => {
      const mockObject = {
        id: mockObjectID,
        owner_id: mockUserID,
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      const result = await service.findPermission(
        mockUserID,
        mockObjectID,
        mockObjectType,
      );
      expect(result.data).toEqual(ROLE.OWNER);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return others permission', async () => {
      const mockObject = {
        id: mockObjectID,
        owner_id: 'mock-owner-id',
      };

      const mockAccess = {
        user_id: mockUserID,
        permission: 'viewer',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockAccess);

      const result = await service.findPermission(
        mockUserID,
        mockObjectID,
        mockObjectType,
      );
      expect(result.data).toEqual(mockAccess.permission);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
    });

    it('should return data as null', async () => {
      const mockObject = {
        id: mockObjectID,
        owner_id: 'mock-owner-id',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => null);

      const result = await service.findPermission(
        mockUserID,
        mockObjectID,
        mockObjectType,
      );
      expect(result.data).toEqual(null);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID,
          },
        },
      );
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID,
          object_id: mockObjectID,
        },
      });
    });
  });

  describe('findObjectsByUser', () => {
    const mockUserID = 'mock-user-ID';
    const mockObjectType = 'board';

    it('should return the list of object_id that user is shared access with', async () => {
      const mockObjectList = Array.from({ length: 3 }, (_, i) => ({
        object_id: `mock-object-id-${i}`,
        user_id: mockUserID,
        object_type: mockObjectType,
      }));

      const mockResult = mockObjectList.map((object) => object.object_id);

      jest
        .spyOn(mockAccessRepository, 'find')
        .mockImplementation(() => mockObjectList);

      const result = await service.findObjectsByUser(
        mockUserID,
        mockObjectType,
      );

      expect(result.data).toEqual(mockResult);
      expect(mockAccessRepository.find).toHaveBeenCalledWith({
        select: ['object_id'],
        where: { user_id: mockUserID, object_type: mockObjectType },
      });
    });

    it('should return the list of object_id that user is shared access with', async () => {
      jest.spyOn(mockAccessRepository, 'find').mockImplementation(() => null);

      const result = await service.findObjectsByUser(
        mockUserID,
        mockObjectType,
      );

      expect(result.data).toEqual([]);
      expect(mockAccessRepository.find).toHaveBeenCalledWith({
        select: ['object_id'],
        where: { user_id: mockUserID, object_type: mockObjectType },
      });
    });
  });

  describe('findUserPermission', () => {
    const mockUserID = 'mock-user-ID';
    const mockObjectID = 'mock-object-ID';

    it('should return the list of object_id that user is shared access with', async () => {
      const mockAccess = {
        object_id: mockObjectID,
        user_id: mockUserID,
        permission: 'viewer',
      };

      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => mockAccess);

      const result = await service.findUserPermission(mockUserID, mockObjectID);

      expect(result.data).toEqual(mockAccess.permission);
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID as string,
          object_id: mockObjectID as string,
        },
      });
    });

    it('should return data as null if access not found', async () => {
      jest
        .spyOn(mockAccessRepository, 'findOne')
        .mockImplementation(() => null);

      const result = await service.findUserPermission(mockUserID, mockObjectID);

      expect(result.data).toEqual(null);
      expect(mockAccessRepository.findOne).toHaveBeenCalledWith({
        where: {
          user_id: mockUserID as string,
          object_id: mockObjectID as string,
        },
      });
    });
  });

  describe('changeOwner', () => {
    const mockObjectID = 'mock-object-ID';
    const mockNewOwnerID = 'mock-new-owner-ID';
    const mockCurrentOwnerID = 'mock-current-owner-ID';
    const mockObjectType = 'board';

    it('should change the board owner and return true', async () => {
      const mockUpdateResult = {
        affected: 1,
      };

      const mockDeleteResult = {
        data: true,
        meta: {},
      };

      const mockCreateResult = {
        data: true,
        meta: {},
      };

      jest
        .spyOn(mockDataSource.manager, 'update')
        .mockImplementation(() => mockUpdateResult);
      jest
        .spyOn(service, 'deleteAccess')
        .mockImplementation(async () => mockDeleteResult);
      jest
        .spyOn(service, 'createAccess')
        .mockImplementation(async () => mockCreateResult);

      const result = await service.changeOwner(
        mockObjectID,
        mockNewOwnerID,
        mockCurrentOwnerID,
        mockObjectType,
      );

      expect(result.data).toEqual(true);
      expect(mockDataSource.manager.update).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        { id: mockObjectID as string },
        { owner_id: mockNewOwnerID as string },
      );
      expect(service.deleteAccess).toHaveBeenCalledWith(
        mockObjectID,
        mockNewOwnerID,
      );
      expect(service.createAccess).toHaveBeenCalledWith(
        mockObjectID,
        [
          {
            user_id: mockCurrentOwnerID,
            permission: 'editor',
          },
        ],
        mockNewOwnerID,
        mockObjectType,
      );
    });

    it('should return false if no object was updated', async () => {
      const mockUpdateResult = {
        affected: 0,
      };

      jest
        .spyOn(mockDataSource.manager, 'update')
        .mockImplementation(() => mockUpdateResult);

      jest.spyOn(service, 'deleteAccess').mockImplementation(jest.fn());
      jest.spyOn(service, 'createAccess').mockImplementation(jest.fn());

      const result = await service.changeOwner(
        mockObjectID,
        mockNewOwnerID,
        mockCurrentOwnerID,
        mockObjectType,
      );

      expect(result.data).toEqual(false);
      expect(service.deleteAccess).not.toHaveBeenCalled();
      expect(service.createAccess).not.toHaveBeenCalled();
    });
  });

  describe('findUserAccessList', () => {
    const mockObjectID = 'mock-object-ID';
    const mockObjectType = 'board';

    it('should return data as a list of users have access', async () => {
      const mockObject = {
        id: mockObjectID,
        owner_id: 'mock-owner-ID',
      };

      const mockOwner = {
        id: mockObject.owner_id,
        name: 'mock-name-owner',
        email: 'mock-email@gmail.com',
        permission: 'owner',
      };

      const mockAccessList = Array.from({ length: 3 }, (_, i) => ({
        user_id: `mock-user-${i}`,
        permission: 'viewer',
        object_id: mockObjectID,
        object_type: mockObjectType,
      }));

      const mockUserIDs = mockAccessList.map((access) => access.user_id);
      const mockUserList = mockAccessList.map((access, i) => ({
        id: access.user_id,
        name: `mock-name-${i}`,
        email: `mock-email-${i}@gmail.com`,
        permission: access.permission,
      }));

      const mockResult = [mockOwner, ...mockUserList];

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockAccessRepository, 'find')
        .mockImplementation(() => mockAccessList);

      jest
        .spyOn(mockDataSource.manager, 'findOneBy')
        .mockImplementation(() => mockOwner);

      jest
        .spyOn(mockDataSource.manager, 'find')
        .mockImplementation(() => mockUserList);

      const result = await service.findUserAccessList(
        mockObjectID,
        mockObjectType,
      );
      expect(result.data).toEqual(mockResult);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID as string,
          },
        },
      );

      expect(mockDataSource.manager.findOneBy).toHaveBeenCalledWith(
        UserEntity,
        {
          id: mockObject.owner_id,
        },
      );

      expect(mockAccessRepository.find).toHaveBeenCalledWith({
        select: ['user_id', 'permission'],
        where: { object_id: mockObjectID, object_type: mockObjectType },
      });

      expect(mockDataSource.manager.find).toHaveBeenCalledWith(UserEntity, {
        where: {
          id: In(mockUserIDs),
        },
      });
    });

    it('should throw error if cannot find the object', async () => {
      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => null);

      await expect(
        service.findUserAccessList(mockObjectID, mockObjectType),
      ).rejects.toThrow(HttpException);

      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID as string,
          },
        },
      );
      expect(mockDataSource.manager.findOneBy).not.toHaveBeenCalled();
      expect(mockAccessRepository.find).not.toHaveBeenCalled();
      expect(mockDataSource.manager.find).not.toHaveBeenCalled();
    });

    it("should throw error if cannot find the object's owner", async () => {
      const mockObject = {
        id: mockObjectID,
        owner_id: 'mock-owner-ID',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockDataSource.manager, 'findOneBy')
        .mockImplementation(() => null);

      await expect(
        service.findUserAccessList(mockObjectID, mockObjectType),
      ).rejects.toThrow(HttpException);

      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID as string,
          },
        },
      );
      expect(mockDataSource.manager.findOneBy).toHaveBeenCalledWith(
        UserEntity,
        {
          id: mockObject.owner_id,
        },
      );
      expect(mockAccessRepository.find).not.toHaveBeenCalled();
      expect(mockDataSource.manager.find).not.toHaveBeenCalled();
    });

    it('should return data as an array containing only the owner if no permissions are found for other users', async () => {
      const mockObject = {
        id: mockObjectID,
        owner_id: 'mock-owner-ID',
      };

      const mockOwner = {
        id: mockObject.owner_id,
        name: 'mock-name-owner',
        email: 'mock-email@gmail.com',
        permission: 'owner',
      };

      jest
        .spyOn(mockDataSource.manager, 'findOne')
        .mockImplementation(() => mockObject);

      jest
        .spyOn(mockDataSource.manager, 'findOneBy')
        .mockImplementation(() => mockOwner);

      jest.spyOn(mockAccessRepository, 'find').mockImplementation(() => null);

      const result = await service.findUserAccessList(
        mockObjectID,
        mockObjectType,
      );
      expect(result.data).toEqual([mockOwner]);
      expect(mockDataSource.manager.findOne).toHaveBeenCalledWith(
        `${OBJECT_ENTITY[mockObjectType]}Entity`,
        {
          where: {
            id: mockObjectID as string,
          },
        },
      );

      expect(mockDataSource.manager.findOneBy).toHaveBeenCalledWith(
        UserEntity,
        {
          id: mockObject.owner_id,
        },
      );

      expect(mockAccessRepository.find).toHaveBeenCalledWith({
        select: ['user_id', 'permission'],
        where: { object_id: mockObjectID, object_type: mockObjectType },
      });

      expect(mockDataSource.manager.find).not.toHaveBeenCalled();
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
