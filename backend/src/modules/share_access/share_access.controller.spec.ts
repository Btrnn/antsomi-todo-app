import { Test, TestingModule } from '@nestjs/testing';
import { AccessController } from './share_access.controller';
import { UserRequest } from '@app/types';
import { AccessService } from './share_access.service';
import {
  AccessCreateDto,
  AccessUpdateDto,
  ChangeOwnerDto,
  DeleteAccessDto,
} from './dto';
import { HttpException } from '@nestjs/common';

describe('ShareAccessController', () => {
  let controller: AccessController;
  let service: AccessService;

  beforeEach(async () => {
    const mockAccessService = {
      findPermission: jest.fn(),
      createAccess: jest.fn(),
      findUserAccessList: jest.fn(),
      updateAccess: jest.fn(),
      deleteAccess: jest.fn(),
      changeOwner: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AccessController],
      providers: [
        {
          provide: AccessService,
          useValue: mockAccessService,
        },
      ],
    }).compile();

    controller = module.get<AccessController>(AccessController);
    service = module.get<AccessService>(AccessService);
  });

  describe('getPermission', () => {
    const user: UserRequest = { id: 'mock-user-id' } as UserRequest;
    const objectID = 'mock-object-id';
    const objectType = 'board';

    it("should call the service.findPermission and return the user's permission", async () => {
      const mockServiceResponse = {
        data: 'editor',
        meta: {},
      };

      jest
        .spyOn(service, 'findPermission')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.getPermission(user, objectID, objectType);
      expect(service.findPermission).toHaveBeenCalledWith(
        user.id,
        objectID,
        objectType,
      );
      expect(result).toEqual(mockServiceResponse);
    });

    it("should call the service.findPermission and return response with data as null if cannot find user's permission", async () => {
      const mockServiceResponse = {
        data: null,
        meta: {},
      };

      jest
        .spyOn(service, 'findPermission')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.getPermission(user, objectID, objectType);
      expect(service.findPermission).toHaveBeenCalledWith(
        user.id,
        objectID,
        objectType,
      );
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('createAccess', () => {
    const user: UserRequest = { id: 'mock-user-id' } as UserRequest;
    const objectID = 'mock-object-id';
    const objectType = 'board';
    it('should call accessService.createAccess with the correct data and return response with data as true if success', async () => {
      const mockNewAccess: AccessCreateDto = {
        permissionList: Array.from({ length: 3 }, (_, i) => ({
          user_id: `mock-user-${i}`,
          permission: 'viewer',
        })),
      };

      const mockServiceResponse = {
        data: true,
        meta: {},
      };

      jest
        .spyOn(service, 'createAccess')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.createAccess(
        objectID,
        objectType,
        mockNewAccess,
        user,
      );

      expect(service.createAccess).toHaveBeenCalledWith(
        objectID,
        mockNewAccess.permissionList,
        user.id,
        objectType,
      );

      expect(result).toEqual(mockServiceResponse);
    });

    it('should call accessService.createAccess with the correct data and return response with data as false if failed', async () => {
      const mockNewAccess: AccessCreateDto = {
        permissionList: Array.from({ length: 3 }, (_, i) => ({
          user_id: `mock-user-${i}`,
          permission: 'viewer',
        })),
      };

      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'createAccess')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.createAccess(
        objectID,
        objectType,
        mockNewAccess,
        user,
      );

      expect(service.createAccess).toHaveBeenCalledWith(
        objectID,
        mockNewAccess.permissionList,
        user.id,
        objectType,
      );

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('getUserAccessList', () => {
    const objectID = 'mock-object-id';
    const objectType = 'board';

    it('should call the service.findUserAccessList and return the users accessed list of this object', async () => {
      const mockUserList = Array.from({ length: 3 }, (_, i) => ({
        id: `mock-user-${i}`,
        permission: 'viewer',
        name: `mock-name-${i}`,
        email: `mock-email-${i}@gmail.com`,
      }));

      const mockServiceResponse = {
        data: mockUserList,
        meta: {},
      };

      jest
        .spyOn(service, 'findUserAccessList')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.getUserAccessList(objectID, objectType);
      expect(service.findUserAccessList).toHaveBeenCalledWith(
        objectID,
        objectType,
      );
      expect(result).toEqual(mockServiceResponse);
    });

    it('should call the service.findUserAccessList and return response with data as [] if cannot find accessed list', async () => {
      const mockServiceResponse = {
        data: [],
        meta: {},
      };

      jest
        .spyOn(service, 'findUserAccessList')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.getUserAccessList(objectID, objectType);

      await expect(result).toEqual(mockServiceResponse);

      expect(service.findUserAccessList).toHaveBeenCalledWith(
        objectID,
        objectType,
      );
    });
  });

  describe('updateAccess', () => {
    const user: UserRequest = { id: 'mock-user-id' } as UserRequest;
    const objectID = 'mock-object-id';
    const objectType = 'board';
    it('should call accessService.updateAccess with the correct data and return response with data as true if success', async () => {
      const mockNewAccess: AccessUpdateDto = {
        permissionList: Array.from({ length: 3 }, (_, i) => ({
          user_id: `mock-user-${i}`,
          permission: 'viewer',
        })),
      };

      const mockServiceResponse = {
        data: true,
        meta: {},
      };

      jest
        .spyOn(service, 'updateAccess')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.updateAccess(
        objectID,
        objectType,
        mockNewAccess,
        user,
      );

      expect(service.updateAccess).toHaveBeenCalledWith(
        objectID,
        mockNewAccess.permissionList,
        user.id,
        objectType,
      );

      expect(result).toEqual(mockServiceResponse);
    });

    it('should call accessService.updateAccess with the correct data and return response with data as false if failed', async () => {
      const mockNewAccess: AccessUpdateDto = {
        permissionList: Array.from({ length: 3 }, (_, i) => ({
          user_id: `mock-user-${i}`,
          permission: 'viewer',
        })),
      };

      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'updateAccess')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.updateAccess(
        objectID,
        objectType,
        mockNewAccess,
        user,
      );

      expect(service.updateAccess).toHaveBeenCalledWith(
        objectID,
        mockNewAccess.permissionList,
        user.id,
        objectType,
      );

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('changeOwner', () => {
    const user: UserRequest = { id: 'mock-user-id' } as UserRequest;
    const objectID = 'mock-object-id';
    const objectType = 'board';
    it('should call accessService.changeOwner with the correct data and return response with data as true if success', async () => {
      const mockNewOwner: ChangeOwnerDto = {
        new_owner: 'mock-new-owner',
      };

      const mockServiceResponse = {
        data: true,
        meta: {},
      };

      jest
        .spyOn(service, 'changeOwner')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.changeOwner(
        objectID,
        objectType,
        mockNewOwner,
        user,
      );

      expect(service.changeOwner).toHaveBeenCalledWith(
        objectID,
        mockNewOwner.new_owner,
        user.id,
        objectType,
      );

      expect(result).toEqual(mockServiceResponse);
    });

    it('should call accessService.changeOwner with the correct data and return response with data as false if failed', async () => {
      const mockNewOwner: ChangeOwnerDto = {
        new_owner: 'mock-new-owner',
      };

      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'changeOwner')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.changeOwner(
        objectID,
        objectType,
        mockNewOwner,
        user,
      );

      expect(service.changeOwner).toHaveBeenCalledWith(
        objectID,
        mockNewOwner.new_owner,
        user.id,
        objectType,
      );

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('deleteAccess', () => {
    const user: UserRequest = { id: 'mock-user-id' } as UserRequest;
    const objectID = 'mock-object-id';
    const objectType = 'board';
    it('should call accessService.deleteAccess with the correct data and return response with data as true if success', async () => {
      const mockDeleteData: DeleteAccessDto = {
        user_id: 'mock-user-id',
      };

      const mockServiceResponse = {
        data: true,
        meta: {},
      };

      jest
        .spyOn(service, 'deleteAccess')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteAccess(
        objectID,
        objectType,
        mockDeleteData,
      );

      expect(service.deleteAccess).toHaveBeenCalledWith(
        objectID,
        mockDeleteData.user_id,
      );

      expect(result).toEqual(mockServiceResponse);
    });

    it('should call accessService.deleteAccess with the correct data and return response with data as false if failed', async () => {
      const mockDeleteData: DeleteAccessDto = {
        user_id: 'mock-user-id',
      };

      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'deleteAccess')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteAccess(
        objectID,
        objectType,
        mockDeleteData,
      );

      expect(service.deleteAccess).toHaveBeenCalledWith(
        objectID,
        mockDeleteData.user_id,
      );

      expect(result).toEqual(mockServiceResponse);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
