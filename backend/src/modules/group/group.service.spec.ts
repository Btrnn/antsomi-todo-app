import { Test, TestingModule } from '@nestjs/testing';
import { GroupService } from './group.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GroupEntity } from './group.entity';
import { DataSource } from 'typeorm';
import { ServiceResponse } from '@app/types';
import { TaskEntity } from '../task/task.entity';

describe('GroupsService', () => {
  let service: GroupService;
  let mockGroupRepository: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockGroupRepository = {
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockManager = {
      delete: jest.fn(),
      find: jest.fn(),
    };

    mockDataSource = {
      manager: mockManager,
      transaction: jest.fn().mockImplementation(async (callback) => {
        await callback(mockManager);
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GroupService,
        {
          provide: getRepositoryToken(GroupEntity),
          useValue: mockGroupRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<GroupService>(GroupService);
  });

  describe('findAll', () => {
    it('should return an array of groups', async () => {
      const boardID = 'mock-board-id';
      const mockGroups = Array.from({ length: 3 }, (_, i) => ({
        id: `group-${i}`,
        board_id: boardID,
      }));

      jest
        .spyOn(mockGroupRepository, 'find')
        .mockImplementation(() => mockGroups);

      const response: ServiceResponse<GroupEntity[]> =
        await service.findAll(boardID);

      expect(mockGroupRepository.find).toHaveBeenCalledWith({
        where: { board_id: boardID },
        order: { position: { direction: 'ASC' } },
      });
      expect(response.data).toEqual(mockGroups);
    });
    it('should return an empty array when no groups are found', async () => {
      const boardID = 'mock-board-id';

      jest.spyOn(mockGroupRepository, 'find').mockImplementation(() => []);

      const response: ServiceResponse<GroupEntity[]> =
        await service.findAll(boardID);

      expect(response.data).toEqual([]);
      expect(mockGroupRepository.find).toHaveBeenCalledWith({
        where: { board_id: boardID },
        order: { position: { direction: 'ASC' } },
      });
    });
  });

  describe('createGroup', () => {
    const mockCreateGroup: Omit<GroupEntity, 'id'> = {
      name: 'Test Task',
      created_at: new Date(),
      type: 'status',
      position: 1,
      owner_id: '1',
      color: '1',
      board_id: '1',
    };

    it('should create a group and return the created group', async () => {
      const mockSavedGroup: GroupEntity = {
        id: '1',
        ...mockCreateGroup,
      };

      jest
        .spyOn(mockGroupRepository, 'save')
        .mockImplementation(() => mockSavedGroup);
      const result: ServiceResponse<GroupEntity> =
        await service.createGroup(mockCreateGroup);

      expect(mockGroupRepository.save).toHaveBeenCalledWith(mockCreateGroup);
      expect(result.data).toEqual(mockSavedGroup);
    });

    it('should throw an error if saving fails', async () => {
      const errorMessage = 'Database error';
      mockGroupRepository.save.mockRejectedValue(new Error(errorMessage));

      await expect(service.createGroup(mockCreateGroup)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('deleteGroup', () => {
    const groupID = 'mock-group-ID';
    it('should delete a group and return true if successful', async () => {
      const mockDeleteResult = {
        affected: 1,
      };

      jest
        .spyOn(mockDataSource.manager, 'delete')
        .mockImplementationOnce(() => mockDeleteResult)
        .mockImplementationOnce(() => mockDeleteResult);

      const result: ServiceResponse<boolean> =
        await service.deleteGroup(groupID);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockDataSource.manager.delete).toHaveBeenCalledWith(GroupEntity, {
        id: groupID,
      });
      expect(mockDataSource.manager.delete).toHaveBeenCalledWith(TaskEntity, {
        status_id: groupID,
      });
      expect(result.data).toEqual(true);
    });

    it('should return false if no group was deleted', async () => {
      const mockDeleteResult = {
        affected: 0,
      };
      jest
        .spyOn(mockDataSource.manager, 'delete')
        .mockImplementationOnce(() => mockDeleteResult)
        .mockImplementationOnce(() => mockDeleteResult);

      const result: ServiceResponse<boolean> =
        await service.deleteGroup(groupID);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockDataSource.manager.delete).toHaveBeenCalledWith(GroupEntity, {
        id: groupID,
      });
      expect(mockDataSource.manager.delete).toHaveBeenCalledWith(TaskEntity, {
        status_id: groupID,
      });

      expect(result.data).toEqual(false);
    });
  });

  describe('updateGroup', () => {
    const groupID = 'mock-group-ID';
    const updateGroup = {
      name: 'Updated name',
      color: '#b7f1d8',
    };
    it('should update a group and return true', async () => {
      const mockUpdateResult = {
        affected: 1,
      };

      jest
        .spyOn(mockGroupRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await service.updateGroup(
        groupID,
        updateGroup,
      );

      expect(mockGroupRepository.update).toHaveBeenCalledWith(
        { id: groupID },
        updateGroup,
      );
      expect(result.data).toEqual(true);
    });

    it('should return false if no group was updated', async () => {
      const mockUpdateResult = {
        affected: 0,
      };

      jest
        .spyOn(mockGroupRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await service.updateGroup(
        groupID,
        updateGroup,
      );

      expect(mockGroupRepository.update).toHaveBeenCalledWith(
        { id: groupID },
        updateGroup,
      );
      expect(result.data).toEqual(false);
    });
  });

  describe('reorderGroup', () => {
    it('should return true if all groups are updated successfully', async () => {
      const mockGroupsPosition = [
        { id: '1', position: 1 },
        { id: '2', position: 2 },
      ];

      const mockReorderResult = {
        affected: 1,
      };

      jest
        .spyOn(mockGroupRepository, 'update')
        .mockImplementation(() => mockReorderResult);

      const result = await service.reorderGroup(mockGroupsPosition);

      expect(mockGroupRepository.update).toHaveBeenCalledTimes(
        mockGroupsPosition.length,
      );
      expect(result.data).toEqual(true);
    });

    it('should return false if any group fails to update', async () => {
      const mockGroupsPosition = [
        { id: '1', position: 1 },
        { id: '2', position: 2 },
      ];

      const mockReorderResults = [
        {
          affected: 1,
        },
        {
          affected: 0,
        },
      ];

      jest
        .spyOn(mockGroupRepository, 'update')
        .mockImplementationOnce(() => mockReorderResults[0])
        .mockImplementationOnce(() => mockReorderResults[1]);

      const result = await service.reorderGroup(mockGroupsPosition);

      expect(mockGroupRepository.update).toHaveBeenCalledTimes(
        mockGroupsPosition.length,
      );
      expect(result.data).toEqual(false);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
