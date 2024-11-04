import { Test, TestingModule } from '@nestjs/testing';
import { AccessService } from './share_access.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AccessEntity } from './share_access.entity';
import { DataSource } from 'typeorm';

describe('BoardUserService', () => {
  let service: AccessService;
  let mockAccessRepository: any;
  let mockDataSource: any;

  beforeEach(async () => {
    mockAccessRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    mockDataSource = {
      manager: {
        find: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccessService,
        {
          provide: getRepositoryToken(AccessEntity),
          useValue: mockAccessRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AccessService>(AccessService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
