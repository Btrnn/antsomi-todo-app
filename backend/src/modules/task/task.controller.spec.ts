// Libraries
import { Test, TestingModule } from '@nestjs/testing';

// Controllers
import { TaskController } from './task.controller';

// Services
import { TaskService } from './task.service';

// Entities
import { UserEntity } from '../user/user.entity';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// DTOs
import {
  TaskCreateDto,
  TaskDeleteDto,
  TaskReorderDto,
  TaskUpdateDto,
} from './dto';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  beforeEach(async () => {
    const mockTaskService = {
      findAll: jest.fn(),
      createTask: jest.fn(),
      deleteTask: jest.fn(),
      deleteTaskByGroupID: jest.fn(),
      updateTask: jest.fn(),
      reorderTask: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  describe('getAllTasks', () => {
    it('should call taskService.findAll with the correct boardID', async () => {
      const boardID: IdentifyId = 'mock-board-id';

      const mockServiceResponse: ServiceResponse<any[]> = {
        data: Array.from({ length: 3 }, (_, i) => ({
          id: `task-${i}`,
          status_id: `group-${i}`,
        })),
        meta: { page: 1 },
      };

      jest
        .spyOn(service, 'findAll')
        .mockImplementation(async () => mockServiceResponse);
      const response = await controller.getAllTasks(boardID);

      expect(service.findAll).toHaveBeenCalledWith(boardID);
      expect(response).toEqual(mockServiceResponse);
    });
  });

  describe('createTask', () => {
    it('should call taskService.createTask with the correct data and return response with data = new task', async () => {
      const mockNewTask: TaskCreateDto = {
        name: 'Test Task',
        description: 'Description of the test task',
        created_at: new Date(),
        start_date: new Date(),
        end_date: new Date(),
        status_id: '1',
        position: 1,
        assignee_id: '1',
        est_time: 1,
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
        data: { id: 'mock-task-id', ...mockNewTask, owner_id: mockUser.id },
        meta: {},
      };

      jest
        .spyOn(service, 'createTask')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.createTask(mockNewTask, mockUser);

      expect(service.createTask).toHaveBeenCalledWith({
        ...mockNewTask,
        owner_id: mockUser.id,
      });

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('deleteTask', () => {
    const mockDeleteTask: TaskDeleteDto = {
      id: 'mock-task-id',
    };
    it('should call taskService.deleteTask with the correct data and return data: true if a task is successfully deleted', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'deleteTask')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteTask(mockDeleteTask);

      expect(service.deleteTask).toHaveBeenCalledWith(mockDeleteTask.id);

      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if no task is deleted', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'deleteTask')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteTask(mockDeleteTask);

      expect(service.deleteTask).toHaveBeenCalledWith(mockDeleteTask.id);

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('deleteTaskByGroupID', () => {
    const mockDeleteGroupId: TaskDeleteDto = {
      id: 'mock-group-id',
    };
    it('should call taskService.deleteTaskByGroupID with the correct data and return data: true if tasks with given groupID are successfully deleted', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'deleteTaskByGroupID')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteTaskByGroupID(mockDeleteGroupId);

      expect(service.deleteTask).toHaveBeenCalledWith(mockDeleteGroupId.id);

      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if no task is deleted', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(service, 'deleteTask')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteTask(mockDeleteGroupId);

      expect(service.deleteTask).toHaveBeenCalledWith(mockDeleteGroupId.id);

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('updateTask', () => {
    const mockUpdateTask = {
      id: 'mock-task-id',
      name: 'newName',
      description: 'description',
    } as TaskUpdateDto;
    const { id, ...otherMockData } = mockUpdateTask;
    it('should call taskService.updateTask with the correct data and return data: true if a task is successfully updated', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'updateTask')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateTask(mockUpdateTask);
      expect(service.updateTask).toHaveBeenCalledWith(id, otherMockData);
      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if no task is updated', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };
      jest
        .spyOn(service, 'updateTask')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateTask(mockUpdateTask);
      expect(service.updateTask).toHaveBeenCalledWith(id, otherMockData);
      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('reorderTask', () => {
    const mockPositionList: TaskReorderDto = {
      positionList: Array.from({ length: 3 }, (_, i) => ({
        id: `mock-task-id-${i}`,
        position: i,
      })),
    };
    it('should call taskService.reorderTask with the correct input data and return data: true if all tasks in positionList are successfully updated', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(service, 'reorderTask')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateTaskPositions(mockPositionList);
      expect(service.reorderTask).toHaveBeenCalledWith(
        mockPositionList.positionList,
      );
      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if tasks are not updated', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };
      jest
        .spyOn(service, 'reorderTask')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateTaskPositions(mockPositionList);
      expect(service.reorderTask).toHaveBeenCalledWith(
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
