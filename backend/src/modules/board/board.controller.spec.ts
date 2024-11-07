// Libraries
import { Test, TestingModule } from '@nestjs/testing';

// Controllers
import { BoardController } from './board.controller';

// Services
import { BoardService } from './board.service';
import { AccessService } from '../share_access/share_access.service';

// Types
import { IdentifyId, ServiceResponse, UserRequest } from '@app/types';

// Entities
import { BoardEntity } from './board.entity';
import { BoardCreateDto, BoardUpdateDto } from './dto';

describe('BoardController', () => {
  let controller: BoardController;
  let boardService: BoardService;
  let accessService: AccessService;

  beforeEach(async () => {
    const mockBoardService = {
      findOwnedAndShared: jest.fn(),
      createBoard: jest.fn(),
      deleteBoard: jest.fn(),
      updateBoard: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: mockBoardService,
        },
        {
          provide: AccessService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<BoardController>(BoardController);
    boardService = module.get<BoardService>(BoardService);
    accessService = module.get<AccessService>(AccessService);
  });

  describe('getAllBoards', () => {
    const user: UserRequest = { id: 'mock-board-id' } as UserRequest;
    it('should call boardService.findAll with the correct boardID', async () => {
      const mockServiceResponse: ServiceResponse<{
        owned: BoardEntity[];
        shared: BoardEntity[];
      }> = {
        data: {
          owned: Array.from({ length: 3 }, (_, i) => ({
            id: `board-${i}`,
          })) as BoardEntity[],
          shared: Array.from({ length: 3 }, (_, i) => ({
            id: `board-${i}`,
          })) as BoardEntity[],
        },
        meta: { page: 1 },
      };

      jest
        .spyOn(boardService, 'findOwnedAndShared')
        .mockImplementation(async () => mockServiceResponse);

      const response = await controller.getAllBoards(user);

      expect(boardService.findOwnedAndShared).toHaveBeenCalledWith(user.id);
      expect(response).toEqual(mockServiceResponse);
    });

    it('should call boardService.findAll with the correct boardID and return data as [] if finding failed', async () => {
      const mockServiceResponse: ServiceResponse<{
        owned: BoardEntity[];
        shared: BoardEntity[];
      }> = {
        data: {
          owned: [],
          shared: [],
        },
        meta: { page: 1 },
      };

      jest
        .spyOn(boardService, 'findOwnedAndShared')
        .mockImplementation(async () => mockServiceResponse);

      const response = await controller.getAllBoards(user);

      expect(boardService.findOwnedAndShared).toHaveBeenCalledWith(user.id);
      expect(response).toEqual(mockServiceResponse);
    });
  });

  describe('createBoard', () => {
    const mockNewBoard: BoardCreateDto = {
      name: 'Test Board',
      position: 1,
    };

    const mockUser: UserRequest = {
      id: 'mock-user-id',
      role: 'admin',
    };
    it('should call boardService.createBoard with the correct data and return response with data as new board', async () => {
      const mockServiceResponse = {
        data: {
          id: 'mock-board-id',
          ...mockNewBoard,
          created_at: new Date(),
          owner_id: mockUser.id,
        },
        meta: {},
      };

      jest
        .spyOn(boardService, 'createBoard')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.createBoard(mockNewBoard, mockUser);

      expect(boardService.createBoard).toHaveBeenCalledWith({
        ...mockNewBoard,
        owner_id: mockUser.id,
      });

      expect(result).toEqual(mockServiceResponse);
    });

    it('should call boardService.createBoard with the correct data and return response with data as null if creating failed', async () => {
      const mockServiceResponse = {
        data: null,
        meta: {},
      };

      jest
        .spyOn(boardService, 'createBoard')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.createBoard(mockNewBoard, mockUser);

      expect(boardService.createBoard).toHaveBeenCalledWith({
        ...mockNewBoard,
        owner_id: mockUser.id,
      });

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('deleteBoard', () => {
    const mockDeleteBoard: IdentifyId = 'mock-board-id';
    it('should call boardService.deleteBoard with the correct data and return data: true if a board is successfully deleted', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(boardService, 'deleteBoard')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteBoard(mockDeleteBoard);

      expect(boardService.deleteBoard).toHaveBeenCalledWith(mockDeleteBoard);

      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if no board is deleted', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };

      jest
        .spyOn(boardService, 'deleteBoard')
        .mockImplementation(async () => mockServiceResponse);

      const result = await controller.deleteBoard(mockDeleteBoard);

      expect(boardService.deleteBoard).toHaveBeenCalledWith(mockDeleteBoard);

      expect(result).toEqual(mockServiceResponse);
    });
  });

  describe('updateBoard', () => {
    const mockBoardID = 'mock-board-id';
    const mockUpdateBoard = {
      name: 'newName',
    } as BoardUpdateDto;

    it('should call boardService.updateBoard with the correct data and return data: true if a board is successfully updated', async () => {
      const mockServiceResponse = {
        data: true,
        meta: {},
      };
      jest
        .spyOn(boardService, 'updateBoard')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateBoard(mockBoardID, mockUpdateBoard);
      expect(boardService.updateBoard).toHaveBeenCalledWith(
        mockBoardID,
        mockUpdateBoard,
      );
      expect(result).toEqual(mockServiceResponse);
    });

    it('should return data: false if no task is updated', async () => {
      const mockServiceResponse = {
        data: false,
        meta: {},
      };
      jest
        .spyOn(boardService, 'updateBoard')
        .mockImplementation(async () => mockServiceResponse);
      const result = await controller.updateBoard(mockBoardID, mockUpdateBoard);
      expect(boardService.updateBoard).toHaveBeenCalledWith(
        mockBoardID,
        mockUpdateBoard,
      );
      expect(result).toEqual(mockServiceResponse);
    });
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(boardService).toBeDefined();
    expect(accessService).toBeDefined();
  });
});
