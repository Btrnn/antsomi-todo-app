// Libraries
import { Test, TestingModule } from '@nestjs/testing';

// Controllers
import { BoardController } from './board.controller';

// Services
import { BoardService } from './board.service';
import { AccessService } from '../share_access/share_access.service';

describe('BoardController', () => {
  let controller: BoardController;
  let boardService: BoardService;
  let accessService: AccessService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BoardController],
      providers: [
        {
          provide: BoardService,
          useValue: {},
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

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(boardService).toBeDefined();
    expect(accessService).toBeDefined();
  });
});
