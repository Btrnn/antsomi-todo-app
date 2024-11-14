// Libraries
import { Test, TestingModule } from '@nestjs/testing';
import { omit } from 'lodash';
import { getRepositoryToken } from '@nestjs/typeorm';

// Services
import { UserService } from './user.service';
import { UserEntity } from './user.entity';

// Types
import { ServiceResponse } from '@app/types';

describe('UserService', () => {
  let service: UserService;
  let mockUserRepository: any;

  beforeEach(async () => {
    mockUserRepository = {
      find: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      findOne: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = Array.from({ length: 3 }, (_, i) => ({
        id: `user-${i}`,
        name: `User ${i}`,
        phone_number: '1234567890',
        email: `user${i}@example.com`,
        password: 'password',
        created_at: new Date(),
        role: 'user',
      }));

      const mockResult = mockUsers.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
      }));

      jest
        .spyOn(mockUserRepository, 'find')
        .mockImplementation(() => mockUsers);

      const result = await service.findAll();
      expect(result.data).toEqual(mockResult);
    });

    it('should return an empty array if no users are found', async () => {
      jest.spyOn(mockUserRepository, 'find').mockImplementation(() => null);

      const result = await service.findAll();
      expect(result.data).toEqual([]);
    });
  });

  describe('findOne', () => {
    const mockUserID = 'mock-user-id';
    it('should return an user', async () => {
      const mockUser = {
        id: mockUserID,
        name: `Mock User`,
        phone_number: '1234567890',
        email: `user@example.com`,
        password: 'password',
        created_at: new Date(),
        role: 'user',
      } as UserEntity;

      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockImplementation(() => mockUser);

      const result = await service.findOne(mockUserID);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUserID,
      });
      expect(result.data).toEqual(omit(mockUser, 'password'));
    });

    it('should return data as null if user is not found', async () => {
      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockImplementation(() => null);

      const result = await service.findOne(mockUserID);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        id: mockUserID,
      });
      expect(result.data).toEqual(null);
    });
  });

  describe('findByEmail', () => {
    const mockUserEmail = 'mock-email@gmail.com';
    it('should return an user', async () => {
      const mockUser = {
        id: 'mock-user-id',
        name: `Mock User`,
        phone_number: '1234567890',
        email: mockUserEmail,
        password: 'password',
        created_at: new Date(),
        role: 'user',
      } as UserEntity;

      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockImplementation(() => mockUser);

      const result = await service.findByEmail(mockUserEmail);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUserEmail,
      });
      expect(result.data).toEqual(
        omit(mockUser, 'password', 'created_at', 'role'),
      );
    });

    it("should return data as null if failed to find user's email", async () => {
      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockImplementation(() => null);

      const result = await service.findByEmail(mockUserEmail);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUserEmail,
      });
      expect(result.data).toEqual(null);
    });
  });

  describe('findByUsername', () => {
    const mockUsername = 'mock-username';
    it('should return an user (with username is email)', async () => {
      const mockUser = {
        id: 'mock-user-id',
        name: `Mock User`,
        phone_number: '1234567890',
        email: mockUsername,
        password: 'password',
        created_at: new Date(),
        role: 'user',
      } as UserEntity;

      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockImplementation(() => mockUser);

      const result = await service.findByUsername(mockUsername);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUsername,
      });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(1);
      expect(result.data).toEqual(mockUser);
    });

    it('should return an user (with username is phone_number)', async () => {
      const mockUser = {
        id: 'mock-user-id',
        name: `Mock User`,
        phone_number: mockUsername,
        email: 'user@example.com',
        password: 'password',
        created_at: new Date(),
        role: 'user',
      } as UserEntity;

      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockImplementationOnce(() => null)
        .mockImplementationOnce(() => mockUser);

      const result = await service.findByUsername(mockUsername);
      expect(result.data).toEqual(mockUser);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUsername,
      });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        phone_number: mockUsername,
      });
    });

    it('should return data: null if user is not found', async () => {
      jest
        .spyOn(mockUserRepository, 'findOneBy')
        .mockImplementation(() => null);

      const result = await service.findByUsername(mockUsername);
      expect(result.data).toEqual(null);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledTimes(2);
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        email: mockUsername,
      });
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        phone_number: mockUsername,
      });
    });
  });

  describe('createUser', () => {
    const mockCreateUser: Omit<UserEntity, 'id' | 'created_at' | 'role'> = {
      name: `Mock User`,
      phone_number: '1234567890',
      email: `user@example.com`,
      password: 'password',
    };

    it('should create a user and return the created user', async () => {
      const mockSavedUser: UserEntity = {
        id: '1',
        created_at: new Date(),
        role: 'user',
        password: 'hashed-password',
        ...mockCreateUser,
      };

      jest
        .spyOn(mockUserRepository, 'save')
        .mockImplementation(() => mockSavedUser);

      const result: ServiceResponse<UserEntity> =
        await service.createUser(mockCreateUser);

      //expect(mockUserRepository.save).toHaveBeenCalledWith(mockCreateUser);
      expect(result.data).toEqual(mockSavedUser);
    });

    it('should return data as null if creating fails', async () => {
      jest.spyOn(mockUserRepository, 'save').mockImplementation(() => null);

      const result: ServiceResponse<UserEntity> =
        await service.createUser(mockCreateUser);

      //expect(mockUserRepository.save).toHaveBeenCalledWith(mockCreateUser);
      expect(result.data).toEqual(null);
    });
  });

  describe('deleteUser', () => {
    const userID = 'mock-user-ID';
    it('should delete a user and return true if successful', async () => {
      const mockDeleteResult = {
        affected: 1,
      };

      jest
        .spyOn(mockUserRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> = await service.deleteUser(userID);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userID);
      expect(result.data).toEqual(true);
    });

    it('should delete a user and return false if failed', async () => {
      const mockDeleteResult = {
        affected: 0,
      };

      jest
        .spyOn(mockUserRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> = await service.deleteUser(userID);

      expect(mockUserRepository.delete).toHaveBeenCalledWith(userID);
      expect(result.data).toEqual(false);
    });
  });

  describe('updateUser', () => {
    const userID = 'mock-user-ID';
    const updateUser = {
      name: 'New name',
      password: 'New password',
    };
    it("should update user's info and return true", async () => {
      const mockUpdateResult = {
        affected: 1,
      };

      jest
        .spyOn(mockUserRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await service.updateUser(
        userID,
        updateUser,
      );

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: userID },
        updateUser,
      );
      expect(result.data).toEqual(true);
    });

    it('should return false if no user was updated', async () => {
      const mockUpdateResult = {
        affected: 0,
      };

      jest
        .spyOn(mockUserRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await service.updateUser(
        userID,
        updateUser,
      );

      expect(mockUserRepository.update).toHaveBeenCalledWith(
        { id: userID },
        updateUser,
      );
      expect(result.data).toEqual(false);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
