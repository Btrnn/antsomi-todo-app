import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { IS_PUBLIC_KEY } from '@app/constants';

describe('AuthGuard', () => {
  let reflector: Reflector;
  let guard: AuthGuard;
  let mockJwtService: any;
  let mockAuthService: any;

  beforeEach(async () => {
    mockJwtService = {
      verifyAsync: jest.fn(),
    };
    mockAuthService = {
      isAcceptedPermission: jest.fn(),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: Reflector,
          useValue: {
            get: jest.fn(),
            getAllAndOverride: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  describe('canActivate', () => {
    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
    it('should return true if the route is public', async () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockImplementation(() => true);
      const result = await guard.canActivate(mockContext);
      expect(result).toEqual(true);
      expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, [
        mockContext.getHandler(),
        mockContext.getClass(),
      ]);
    });
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(reflector).toBeDefined();
  });
});
