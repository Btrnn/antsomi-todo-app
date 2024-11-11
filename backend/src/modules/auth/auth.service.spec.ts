// Libraries
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

// Services
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { AccessService } from '../share_access/share_access.service';

describe('AuthService', () => {
  let service: AuthService;
  let mockUserService: any;
  let mockAccessService: any;
  let mockDataSource: any;
  let mockJwtService: any;

  beforeEach(async () => {
    mockUserService = {
      findByUsername: jest.fn(),
    };
    mockJwtService = {
      signAsync: jest.fn(),
    };
    mockAccessService = {
      findUserPermission: jest.fn(),
    };
    mockDataSource = {
      manager: {
        findOneBy: jest.fn(),
      },
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: AccessService,
          useValue: mockAccessService,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
