import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { ServiceResponse, UserRequest } from '@app/types';
import {
  UserCreateDto,
  UserDeleteDto,
  UserGetInfoDto,
  UserUpdateDto,
} from './dto';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  beforeEach(async () => {
    const mockUserService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      createUser: jest.fn(),
      deleteUser: jest.fn(),
      findByEmail: jest.fn(),
      updateUser: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  describe('getAllUsers', () => {
    it('should call userService.findAll and return data as list of users', async () => {
      const mockServiceResponse: ServiceResponse<any[]> = {
        data: Array.from({ length: 3 }, (_, i) => ({
          id: `user-${i}`,
        })),
        meta: { page: 1 },
      };

      jest
        .spyOn(service, 'findAll')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getAllUsers();

      expect(service.findAll).toHaveBeenCalled();
      expect(response).toEqual(mockServiceResponse);
    });
    it('should call userService.findAll and return data as [] if failed', async () => {
      const mockServiceResponse: ServiceResponse<any[]> = {
        data: [],
        meta: { page: 1 },
      };

      jest
        .spyOn(service, 'findAll')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getAllUsers();

      expect(service.findAll).toHaveBeenCalled();
      expect(response).toEqual(mockServiceResponse);
    });
  });

  describe('getUserInfo', () => {
    const mockUser: UserRequest = {
      id: 'mock-user-id',
      role: 'user',
    };
    it('should call userService.findOne with the correct id and return that user info', async () => {
      const mockServiceResponse = {
        data: {
          id: mockUser.id,
          name: `Mock User`,
          phone_number: '1234567890',
          email: `user@example.com`,
          password: 'password',
          created_at: new Date(),
          role: mockUser.role,
        },
        meta: { page: 1 },
      };

      jest
        .spyOn(service, 'findOne')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getUserInfo(mockUser);

      expect(service.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(response).toEqual(mockServiceResponse);
    });

    it('should call userService.findOne with the correct id and return data as null if failed to find user', async () => {
      const mockServiceResponse = {
        data: null,
        meta: { page: 1 },
      };

      jest
        .spyOn(service, 'findOne')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getUserInfo(mockUser);

      expect(service.findOne).toHaveBeenCalledWith(mockUser.id);
      expect(response).toEqual(mockServiceResponse);
    });
  });

  describe('getInfoByEmail', () => {
    const mockFindData: UserGetInfoDto = {
      email: 'mock-email',
    };
    it("should call userService.findByEmail with the correct email and return user's info", async () => {
      const mockServiceResponse = {
        data: {
          id: 'mock-user-id',
          name: `Mock User`,
          email: mockFindData.email,
        },
        meta: {},
      };

      jest
        .spyOn(service, 'findByEmail')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getInfoByEmail(mockFindData);

      expect(service.findByEmail).toHaveBeenCalledWith(mockFindData.email);
      expect(response).toEqual(mockServiceResponse);
    });

    it('should call userService.findByEmail with the correct email and return data as null if failed to find', async () => {
      const mockServiceResponse = {
        data: null,
        meta: {},
      };

      jest
        .spyOn(service, 'findByEmail')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getInfoByEmail(mockFindData);

      expect(service.findByEmail).toHaveBeenCalledWith(mockFindData.email);
      expect(response).toEqual(mockServiceResponse);
    });
  });

  describe('createUser', () => {
    it('should call userService.createUser with the correct data and return response with data as new user', async () => {
      const mockNewUser: UserCreateDto = {
        name: 'User',
        phone_number: '123-456-7890',
        password: 'password123',
        email: 'user@example.com',
      };

      const mockServiceResponse = {
        data: {
          id: 'mock-user-id',
          ...mockNewUser,
          created_at: new Date(),
          role: 'user',
        },
        meta: {},
      };

      jest
        .spyOn(service, 'createUser')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.createUser(mockNewUser);

      expect(service.createUser).toHaveBeenCalledWith(mockNewUser);

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('deleteUser', () => {
    const mockDeleteUser: UserDeleteDto = {
      id: 'mock-user-id',
    };
    it('should call userService.deleteUser with the correct data and return data as true if a user is successfully deleted', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'deleteUser')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteUser(mockDeleteUser);

      expect(service.deleteUser).toHaveBeenCalledWith(mockDeleteUser.id);

      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data as false if no user is deleted', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'deleteUser')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteUser(mockDeleteUser);

      expect(service.deleteUser).toHaveBeenCalledWith(mockDeleteUser.id);

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('updateUser', () => {
    const mockUser: UserRequest = {
      id: 'mock-user-id',
      role: 'user',
    };

    const mockUpdateUser = {
      name: 'newName',
      password: 'newPassword',
    } as UserUpdateDto;

    it('should call userService.updateUser with the correct data and return data as true if a user is successfully updated', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'updateUser')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateUser(mockUser, mockUpdateUser);
      expect(service.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        mockUpdateUser,
      );
      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data as false if no user is updated', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };
      jest
        .spyOn(service, 'updateUser')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateUser(mockUser, mockUpdateUser);
      expect(service.updateUser).toHaveBeenCalledWith(
        mockUser.id,
        mockUpdateUser,
      );
      expect(result).toEqual(mockServiceResponse);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
