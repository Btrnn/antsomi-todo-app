// Libraries
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, In } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';

// Services
import { TaskService } from './task.service';

// Types
import { ServiceResponse } from '@app/types';

// Entities
import { TaskEntity } from './task.entity';
import { GroupEntity } from '../group/group.entity';

describe('TaskService', () => {
  let service: TaskService;
  let mockTaskRepository: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockTaskRepository = {
      find: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    mockDataSource = {
      manager: {
        find: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getRepositoryToken(TaskEntity),
          useValue: mockTaskRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
  });

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const boardID = 'mock-board-id';
      const mockGroups = Array.from({ length: 3 }, (_, i) => ({
        id: `group-${i}`,
        board_id: boardID,
      }));
      const mockTasks = mockGroups.map(({ id: groupId }, i) => ({
        id: `task-${i}`,
        status_id: groupId,
        position: i + 1,
      }));

      jest
        .spyOn(mockDataSource.manager, 'find')
        .mockImplementation(() => mockGroups);

      jest
        .spyOn(mockTaskRepository, 'find')
        .mockImplementation(() => mockTasks);

      const response: ServiceResponse<TaskEntity[]> =
        await service.findAll(boardID);

      expect(response.data).toEqual(mockTasks);
      expect(mockDataSource.manager.find).toHaveBeenCalledWith(GroupEntity, {
        where: { board_id: boardID },
      });
      expect(mockTaskRepository.find).toHaveBeenCalledWith({
        where: { status_id: In(mockGroups.map(({ id }) => id)) },
        order: { position: { direction: 'ASC' } },
      });
    });
    it('should return an empty array when no groups are found', async () => {
      const boardID = 'some-board-id';

      jest.spyOn(mockDataSource.manager, 'find').mockImplementation(() => []);

      const response: ServiceResponse<TaskEntity[]> =
        await service.findAll(boardID);

      expect(response.data).toEqual([]);
      expect(mockDataSource.manager.find).toHaveBeenCalledWith(GroupEntity, {
        where: { board_id: boardID },
      });
      expect(mockTaskRepository.find).not.toHaveBeenCalled();
    });
  });

  describe('createTask', () => {
    const mockCreateTask: Omit<TaskEntity, 'id'> = {
      name: 'Test Task',
      description: 'Description of the test task',
      created_at: new Date(),
      start_date: new Date(),
      end_date: new Date(),
      status_id: '1',
      position: 1,
      assignee_id: '1',
      est_time: 1,
      owner_id: '1',
    };

    it('should create a task and return the created task', async () => {
      const mockSavedTask: TaskEntity = {
        id: '2',
        ...mockCreateTask,
      };

      jest
        .spyOn(mockTaskRepository, 'save')
        .mockImplementation(() => mockSavedTask);
      const result: ServiceResponse<TaskEntity> =
        await service.createTask(mockCreateTask);

      expect(mockTaskRepository.save).toHaveBeenCalledWith(mockCreateTask);
      expect(result.data).toEqual(mockSavedTask);
    });

    it('should return data as null if saving fails', async () => {
      jest.spyOn(mockTaskRepository, 'save').mockImplementation(() => null);
      const result: ServiceResponse<TaskEntity> =
        await service.createTask(mockCreateTask);

      expect(mockTaskRepository.save).toHaveBeenCalledWith(mockCreateTask);
      expect(result.data).toEqual(null);
    });
  });

  describe('deleteTaskByGroupID', () => {
    const groupID = 'mock-group-ID';
    it('should delete a task and return true if successful', async () => {
      const mockDeleteResult = {
        affected: 1,
      };

      jest
        .spyOn(mockTaskRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> =
        await service.deleteTaskByGroupID(groupID);

      expect(mockTaskRepository.delete).toHaveBeenCalledWith({
        status_id: groupID,
      });
      expect(result.data).toEqual(true);
    });

    it('should return false if the task does not exist', async () => {
      const mockDeleteResult = {
        affected: 0,
      };
      jest
        .spyOn(mockTaskRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> =
        await service.deleteTaskByGroupID(groupID);

      expect(mockTaskRepository.delete).toHaveBeenCalledWith({
        status_id: groupID,
      });
      expect(result.data).toEqual(false);
    });
  });

  describe('deleteTask', () => {
    const taskID = 'mock-task-ID';
    it('should delete a task and return true if successful', async () => {
      const mockDeleteResult = {
        affected: 1,
      };

      jest
        .spyOn(mockTaskRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> = await service.deleteTask(taskID);

      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskID);
      expect(result.data).toEqual(true);
    });

    it('should return false if no task was deleted', async () => {
      const mockDeleteResult = {
        affected: 0,
      };
      jest
        .spyOn(mockTaskRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> = await service.deleteTask(taskID);

      expect(mockTaskRepository.delete).toHaveBeenCalledWith(taskID);
      expect(result.data).toEqual(false);
    });
  });

  describe('updateTask', () => {
    const taskID = 'mock-task-ID';
    const updateTask = {
      name: 'Updated name',
      description: 'Updated description',
    };
    it('should update a task and return true', async () => {
      const mockUpdateResult = {
        affected: 1,
      };

      jest
        .spyOn(mockTaskRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await service.updateTask(
        taskID,
        updateTask,
      );

      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        { id: taskID },
        updateTask,
      );
      expect(result.data).toEqual(true);
    });

    it('should return false if no task was updated', async () => {
      const mockUpdateResult = {
        affected: 0,
      };

      jest
        .spyOn(mockTaskRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await service.updateTask(
        taskID,
        updateTask,
      );

      expect(mockTaskRepository.update).toHaveBeenCalledWith(
        { id: taskID },
        updateTask,
      );
      expect(result.data).toEqual(false);
    });
  });

  describe('reorderTask', () => {
    it('should return true if all tasks are updated successfully', async () => {
      const mockTasksPosition = [
        { id: '1', position: 1 },
        { id: '2', position: 2 },
      ];

      const mockReorderResult = {
        affected: 1,
      };

      jest
        .spyOn(mockTaskRepository, 'update')
        .mockImplementation(() => mockReorderResult);

      const result = await service.reorderTask(mockTasksPosition);

      expect(mockTaskRepository.update).toHaveBeenCalledTimes(
        mockTasksPosition.length,
      );
      expect(result.data).toEqual(true);
    });

    it('should return false if any task fails to update', async () => {
      const mockTasksPosition = [
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
        .spyOn(mockTaskRepository, 'update')
        .mockImplementationOnce(() => mockReorderResults[0])
        .mockImplementationOnce(() => mockReorderResults[1]);

      const result = await service.reorderTask(mockTasksPosition);

      expect(mockTaskRepository.update).toHaveBeenCalledTimes(
        mockTasksPosition.length,
      );
      expect(result.data).toEqual(false);
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
