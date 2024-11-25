// Libraries
import { SOCKET_QUERY_KEY } from '@app/constants';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';

export const Object = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const client: Socket = ctx.switchToWs().getClient();
    const object = client.handshake.query[SOCKET_QUERY_KEY.OBJECT];
    if (!object) {
      console.log('object is required');
    }
    return JSON.parse(object as string);
  },
);
