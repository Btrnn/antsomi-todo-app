// Libraries
import { isUUID } from 'class-validator';
import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';

// Constants
import { jwtConstants } from './constants';
import {
  IS_PUBLIC_KEY,
  PERMISSION_KEY,
  PERMISSION,
  PARAM_KEY,
  OBJECT_TYPE,
  OBJECT_KEY,
  SOCKET_QUERY_KEY,
} from '@app/constants';

// Services
import { AuthService } from './auth.service';

// Entities
import { TaskEntity } from '../task/task.entity';
import { GroupEntity } from '../group/group.entity';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
    private readonly dataSource: DataSource,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const { request, client, token } = this.extractTokenFromHeader(context);

    //console.log({ request, client, token });

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

      if (request) {
        request['user'] = payload;
      }
      if (client) {
        client['user'] = payload;
      }
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

    if (!requiredPermission) return true;

    const contextObjectType =
      (this.reflector.get<any>(OBJECT_KEY, context.getHandler()) as any) ||
      null;

    let objectID,
      objectType = contextObjectType,
      userID;
    if (request) {
      userID = request['user'].id;
      objectID = request.params[PARAM_KEY.OBJECT];
      if (request.query[PARAM_KEY.TYPE]) {
        objectType = request.query[PARAM_KEY.TYPE];
      }
    }
    if (client) {
      userID = client['user'].id;
      const object = JSON.parse(
        client.handshake.query[SOCKET_QUERY_KEY.OBJECT] as string,
      );

      const task = await this.dataSource.manager.findOneBy(TaskEntity, {
        id: object.id,
      });

      const group = await this.dataSource.manager.findOneBy(GroupEntity, {
        id: task.status_id,
      });

      objectID = group.board_id;
    }

    if (
      !objectType ||
      !objectID ||
      !isUUID(objectID) ||
      !Object.values(OBJECT_TYPE).includes(objectType)
    ) {
      throw new HttpException(
        {
          statusCode: HttpStatus.BAD_REQUEST,
          statusMessage: `Action failed: Invalid parameters`,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    const hasAccess = await this.authService.isAcceptedPermission(
      userID,
      objectID,
      PERMISSION[requiredPermission],
      objectType,
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

  private extractTokenFromHeader(context: ExecutionContext): {
    request: any;
    client: any;
    token: string | undefined;
  } {
    const contextType = context.getType();
    let request = null,
      client = null,
      token = null,
      type = '';
    if (contextType === 'http') {
      request = context.switchToHttp().getRequest();
      [type, token] = request.headers.authorization?.split(' ') ?? [];
    } else if (contextType === 'ws') {
      client = context.switchToWs().getClient();
      [type, token] =
        client.handshake.headers['authorization']?.split(' ') ?? [];
    }

    return {
      request,
      client,
      token: type === 'Bearer' ? token : undefined,
    };
  }
}
