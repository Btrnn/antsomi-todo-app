// Libraries
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    if (request) {
      return request['user'];
    }
    const client: Socket = ctx.switchToWs().getClient();
    return client['user'];
  },
);
