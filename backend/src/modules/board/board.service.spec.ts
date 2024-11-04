// Libraries
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Services
import { BoardService } from './board.service';
import { AccessService } from '../share_access/share_access.service';
import { GroupService } from '../group/group.service';

// Entities
import { BoardEntity } from './board.entity';

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
    };

    mockDataSource = {
      manager: {
        find: jest.fn(),
      },
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

  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });
});
