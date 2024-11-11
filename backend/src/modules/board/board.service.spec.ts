// Libraries
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';

// Services
import { BoardService } from './board.service';
import { AccessService } from '../share_access/share_access.service';
import { GroupService } from '../group/group.service';

// Entities
import { BoardEntity } from './board.entity';
import { GroupEntity } from '../group/group.entity';

// Types
import { ServiceResponse } from '@app/types';

// Constants
import { OBJECT_TYPE } from '@app/constants';

describe('BoardService', () => {
  let boardService: BoardService;
  let mockBoardRepository: any;
  let mockAccessService: any;
  let mockGroupService: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockBoardRepository = {
      find: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      update: jest.fn(),
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

    mockAccessService = {
      findObjectsByUser: jest.fn(),
      findUserPermission: jest.fn(),
      createAccess: jest.fn(),
      updateAccess: jest.fn(),
      deleteAccess: jest.fn(),
      findUserAccessListByObjectId: jest.fn(),
    };

    mockGroupService = {
      deleteGroup: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BoardService,
        {
          provide: getRepositoryToken(BoardEntity),
          useValue: mockBoardRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: AccessService,
          useValue: mockAccessService,
        },
        {
          provide: GroupService,
          useValue: mockGroupService,
        },
      ],
    }).compile();

    boardService = module.get<BoardService>(BoardService);
  });

  describe('findOwned', () => {
    it("should return an array of user's boards", async () => {
      const userID = 'mock-user-id';
      const mockBoards = Array.from({ length: 3 }, (_, i) => ({
        id: `board-${i}`,
        owner_id: userID,
      }));

      jest
        .spyOn(mockBoardRepository, 'find')
        .mockImplementation(() => mockBoards);

      const response: ServiceResponse<BoardEntity[]> =
        await boardService.findOwned(userID);

      expect(mockBoardRepository.find).toHaveBeenCalledWith({
        where: {
          owner_id: userID,
        },
        order: {
          position: {
            direction: 'ASC',
          },
        },
      });
      expect(response.data).toEqual(mockBoards);
    });
    it('should return an empty array when no board are found', async () => {
      const userID = 'mock-user-id';

      jest.spyOn(mockBoardRepository, 'find').mockImplementation(() => []);

      const response: ServiceResponse<BoardEntity[]> =
        await boardService.findOwned(userID);

      expect(response.data).toEqual([]);
      expect(mockBoardRepository.find).toHaveBeenCalledWith({
        where: {
          owner_id: userID,
        },
        order: {
          position: {
            direction: 'ASC',
          },
        },
      });
    });
  });

  describe('findShared', () => {
    it('should return an array of boards that user has access to', async () => {
      const userID = 'mock-user-id';
      const mockBoards = Array.from({ length: 3 }, (_, i) => ({
        id: `board-${i}`,
      }));
      const mockAccessedBoards = {
        data: Array.from({ length: 3 }, (_, i) => `board-${i}`),
      };

      jest
        .spyOn(mockAccessService, 'findObjectsByUser')
        .mockImplementation(() => mockAccessedBoards);

      jest
        .spyOn(mockBoardRepository, 'find')
        .mockImplementation(() => mockBoards);

      const response: ServiceResponse<BoardEntity[]> =
        await boardService.findShared(userID);

      expect(mockAccessService.findObjectsByUser).toHaveBeenCalledWith(
        userID,
        OBJECT_TYPE.BOARD,
      );

      expect(mockBoardRepository.find).toHaveBeenCalledWith({
        where: {
          id: In(mockAccessedBoards.data),
        },
        order: {
          created_at: {
            direction: 'ASC',
          },
        },
      });
      expect(response.data).toEqual(mockBoards);
    });
    it('should return an empty array when no access are found', async () => {
      const userID = 'mock-user-id';
      const mockAccessedBoards = {
        data: [],
      };

      jest
        .spyOn(mockAccessService, 'findObjectsByUser')
        .mockImplementation(() => mockAccessedBoards);

      const response: ServiceResponse<BoardEntity[]> =
        await boardService.findShared(userID);

      expect(mockBoardRepository.find).not.toHaveBeenCalled();
      expect(response.data).toEqual([]);
    });
  });

  describe('findOwnedAndShared', () => {
    it("should return an array of user's owned and shared boards", async () => {
      const userID = 'mock-user-id';
      const mockOwnedBoards = {
        data: Array.from({ length: 3 }, (_, i) => ({
          id: `board-${i}`,
        })) as BoardEntity[],
      };
      const mockSharedBoards = {
        data: Array.from({ length: 5 }, (_, i) => ({
          id: `board-${i}`,
        })) as BoardEntity[],
      };

      const mockResult = {
        owned: mockOwnedBoards.data,
        shared: mockSharedBoards.data,
      };

      jest
        .spyOn(boardService, 'findOwned')
        .mockImplementation(async () => mockOwnedBoards);

      jest
        .spyOn(boardService, 'findShared')
        .mockImplementation(async () => mockSharedBoards);

      const response: ServiceResponse<{
        shared: BoardEntity[];
        owned: BoardEntity[];
      }> = await boardService.findOwnedAndShared(userID);

      expect(boardService.findOwned).toHaveBeenCalledWith(userID);
      expect(boardService.findShared).toHaveBeenCalledWith(userID);
      expect(response.data).toEqual(mockResult);
    });
    it('should return an empty array when no board are found', async () => {
      const userID = 'mock-user-id';
      const mockOwnedBoards = {
        data: [],
      };
      const mockSharedBoards = {
        data: [],
      };

      jest
        .spyOn(boardService, 'findOwned')
        .mockImplementation(async () => mockOwnedBoards);

      jest
        .spyOn(boardService, 'findShared')
        .mockImplementation(async () => mockSharedBoards);

      const response: ServiceResponse<{
        shared: BoardEntity[];
        owned: BoardEntity[];
      }> = await boardService.findOwnedAndShared(userID);

      expect(boardService.findOwned).toHaveBeenCalledWith(userID);
      expect(boardService.findShared).toHaveBeenCalledWith(userID);
      expect(response.data).toEqual({
        owned: [],
        shared: [],
      });
    });
  });

  describe('createBoard', () => {
    const mockCreateBoard: Omit<BoardEntity, 'id' | 'created_at'> = {
      name: 'Test Task',
      position: 1,
      owner_id: '1',
    };

    it('should create a board and return the created board', async () => {
      const mockSavedBoard: BoardEntity = {
        id: '1',
        created_at: new Date(),
        ...mockCreateBoard,
      };

      jest
        .spyOn(mockBoardRepository, 'save')
        .mockImplementation(() => mockSavedBoard);
      const result: ServiceResponse<BoardEntity> =
        await boardService.createBoard(mockCreateBoard);

      expect(mockBoardRepository.save).toHaveBeenCalledWith(mockCreateBoard);
      expect(result.data).toEqual(mockSavedBoard);
    });

    it('should return data as null if saving fails', async () => {
      jest.spyOn(mockBoardRepository, 'save').mockImplementation(() => null);
      const result: ServiceResponse<BoardEntity> =
        await boardService.createBoard(mockCreateBoard);

      expect(mockBoardRepository.save).toHaveBeenCalledWith(mockCreateBoard);
      expect(result.data).toEqual(null);
    });
  });

  describe('deleteBoard', () => {
    const boardID = 'mock-board-ID';
    it('should delete a board and return true if successful', async () => {
      const mockDeleteResult = {
        affected: 1,
      };

      const mockGroupList = Array.from({ length: 3 }, (_, i) => ({
        id: `group-${i}`,
      }));

      jest
        .spyOn(mockDataSource.manager, 'find')
        .mockImplementation(() => mockGroupList);

      jest
        .spyOn(mockDataSource.manager, 'delete')
        .mockImplementation(() => mockDeleteResult);

      jest
        .spyOn(mockGroupService, 'deleteGroup')
        .mockImplementation(() => mockDeleteResult);

      jest
        .spyOn(mockBoardRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> =
        await boardService.deleteBoard(boardID);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockDataSource.manager.find).toHaveBeenCalledWith(GroupEntity, {
        select: ['id'],
        where: { board_id: boardID as string },
      });
      for (const group of mockGroupList) {
        expect(mockGroupService.deleteGroup).toHaveBeenCalledWith(group.id);
      }

      const calledGroupIds = mockGroupService.deleteGroup.mock.calls.map(
        (group) => group[0],
      );
      const mockGroupIds = mockGroupList.map((group) => group.id);
      calledGroupIds.forEach((id) => {
        expect(mockGroupIds).toContain(id);
      });

      expect(mockBoardRepository.delete).toHaveBeenCalledWith({ id: boardID });
      expect(result.data).toEqual(true);
    });

    it('should return false if no board was deleted', async () => {
      const mockDeleteResult = {
        affected: 0,
      };

      jest.spyOn(mockDataSource.manager, 'find').mockImplementation(() => []);

      jest
        .spyOn(mockBoardRepository, 'delete')
        .mockImplementation(() => mockDeleteResult);

      const result: ServiceResponse<boolean> =
        await boardService.deleteBoard(boardID);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockDataSource.manager.find).toHaveBeenCalledWith(GroupEntity, {
        select: ['id'],
        where: { board_id: boardID as string },
      });

      expect(mockGroupService.deleteGroup).not.toHaveBeenCalled();
      expect(mockBoardRepository.delete).toHaveBeenCalledWith({ id: boardID });
      expect(result.data).toEqual(false);
    });
  });

  describe('updateBoard', () => {
    const boardID = 'mock-board-ID';
    const updateBoard = {
      name: 'Updated name',
    };
    it('should update a board and return true', async () => {
      const mockUpdateResult = {
        affected: 1,
      };

      jest
        .spyOn(mockBoardRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await boardService.updateBoard(
        boardID,
        updateBoard,
      );

      expect(mockBoardRepository.update).toHaveBeenCalledWith(
        { id: boardID },
        updateBoard,
      );
      expect(result.data).toEqual(true);
    });

    it('should return false if no board was updated', async () => {
      const mockUpdateResult = {
        affected: 0,
      };

      jest
        .spyOn(mockBoardRepository, 'update')
        .mockImplementation(() => mockUpdateResult);

      const result: ServiceResponse<boolean> = await boardService.updateBoard(
        boardID,
        updateBoard,
      );

      expect(mockBoardRepository.update).toHaveBeenCalledWith(
        { id: boardID },
        updateBoard,
      );
      expect(result.data).toEqual(false);
    });
  });

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });
});
