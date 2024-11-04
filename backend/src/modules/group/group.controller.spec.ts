// Libraries
import { Test, TestingModule } from '@nestjs/testing';

// Controllers
import { GroupController } from './group.controller';

// Services
import { GroupService } from './group.service';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// DTOs
import {
  GroupCreateDto,
  GroupDeleteDto,
  GroupReorderDto,
  GroupUpdateDto,
} from './dto';

// Entities
import { UserEntity } from '../user/user.entity';

describe('GroupsController', () => {
  let controller: GroupController;
  let service: GroupService;

  beforeEach(async () => {
    const mockGroupService = {
      createGroup: jest.fn(),
      findAll: jest.fn(),
      reorderGroup: jest.fn(),
      updateGroup: jest.fn(),
      deleteGroup: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GroupController],
      providers: [
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    controller = module.get<GroupController>(GroupController);
    service = module.get<GroupService>(GroupService);
  });

  describe('getAllGroups', () => {
    it('should call groupService.findAll with the correct boardID', async () => {
      const boardID: IdentifyId = 'mock-board-id';
      const mockServiceResponse: ServiceResponse<any[]> = {
        data: Array.from({ length: 3 }, (_, i) => ({
          id: `group-${i}`,
          board_id: boardID,
        })),
        meta: { page: 1 },
      };

      jest
        .spyOn(service, 'findAll')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getAllGroups(boardID);

      expect(service.findAll).toHaveBeenCalledWith(boardID);
      expect(response).toEqual(mockServiceResponse);
    });
  });

  describe('createGroup', () => {
    it('should call groupService.createGroup with the correct data and return response with data = new group', async () => {
      const mockBoardID: IdentifyId = 'mock-board-id';
      const mockNewGroup: GroupCreateDto = {
        name: 'Test Group',
        created_at: new Date(),
        position: 1,
        type: 'status',
        color: '1',
      };

      const mockUser: UserEntity = {
        id: 'mock-user-id',
        name: 'User',
        phone_number: '123-456-7890',
        password: 'password123',
        email: 'user@example.com',
        created_at: new Date(),
        role: 'admin',
      };

      const mockServiceResponse = {
        data: {
          id: 'mock-group-id',
          ...mockNewGroup,
          owner_id: mockUser.id,
          board_id: mockBoardID,
        },
        meta: {},
      };

      jest
        .spyOn(service, 'createGroup')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.createGroup(
        mockBoardID,
        mockNewGroup,
        mockUser,
      );

      expect(service.createGroup).toHaveBeenCalledWith({
        ...mockNewGroup,
        owner_id: mockUser.id,
        board_id: mockBoardID,
      });

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('deleteGroup', () => {
    const mockDeleteGroup: GroupDeleteDto = {
      id: 'mock-group-id',
    };
    it('should call groupService.deleteGroup with the correct data and return data: true if a group is successfully deleted', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'deleteGroup')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteGroup(mockDeleteGroup);

      expect(service.deleteGroup).toHaveBeenCalledWith(mockDeleteGroup.id);

      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if no group is deleted', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'deleteGroup')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteGroup(mockDeleteGroup);

      expect(service.deleteGroup).toHaveBeenCalledWith(mockDeleteGroup.id);

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('updateGroup', () => {
    const mockUpdateGroup = {
      id: 'mock-group-id',
      name: 'newName',
    } as GroupUpdateDto;
    const { id, ...otherMockData } = mockUpdateGroup;

    it('should call groupService.updateGroup with the correct data and return data: true if a group is successfully updated', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'updateGroup')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateGroup(mockUpdateGroup);
      expect(service.updateGroup).toHaveBeenCalledWith(id, otherMockData);
      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if no task is updated', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };
      jest
        .spyOn(service, 'updateGroup')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateGroup(mockUpdateGroup);
      expect(service.updateGroup).toHaveBeenCalledWith(id, otherMockData);
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('reorderGroup', () => {
    const mockPositionList: GroupReorderDto = {
      positionList: Array.from({ length: 3 }, (_, i) => ({
        id: `mock-group-id-${i}`,
        position: i,
      })),
    };
    it('should call groupService.reorderGroup with the correct input data and return data: true if all groups in positionList are successfully updated', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'reorderGroup')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateGroupPositions(mockPositionList);
      expect(service.reorderGroup).toHaveBeenCalledWith(
        mockPositionList.positionList,
      );
      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if groups are not updated', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };
      jest
        .spyOn(service, 'reorderGroup')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateGroupPositions(mockPositionList);
      expect(service.reorderGroup).toHaveBeenCalledWith(
        mockPositionList.positionList,
      );
      expect(result).toEqual(mockServiceResponse);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });
});
