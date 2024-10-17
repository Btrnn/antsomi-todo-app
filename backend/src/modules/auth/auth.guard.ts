// Libraries
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

// Constants
import { jwtConstants } from './constants';
import {
  IS_PUBLIC_KEY,
  PERMISSION_KEY,
  OBJECT_KEY,
  PERMISSION,
  ACCESS_OBJECT,
} from '@app/constants';

// Services
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          statusMessage: 'Action failed!',
        },
        HttpStatus.CONFLICT,
      );
    }
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      request['user'] = payload;
    } catch {
      throw new HttpException(
        {
          statusCode: HttpStatus.UNAUTHORIZED,
          statusMessage:
            'Your session has expired. Please log in again to continue.',
        },
        HttpStatus.UNAUTHORIZED,
      );
    }

    const requiredPermission = this.reflector.get<keyof typeof PERMISSION>(
      PERMISSION_KEY,
      context.getHandler(),
    );

    const objectType = this.reflector.get<string>(
      OBJECT_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) return true;

    const hasAccess = await this.authService.isAcceptedPermission(
      request['user'].id,
      request.params[objectType],
      PERMISSION[requiredPermission],
    );

    if (!hasAccess.data) {
      throw new HttpException(
        {
          statusCode: HttpStatus.FORBIDDEN,
          statusMessage:
            'Action failed: You do not have permission to perform this action.',
        },
        HttpStatus.FORBIDDEN,
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
