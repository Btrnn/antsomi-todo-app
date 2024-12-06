// Libraries
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// Guards
import { AuthGuard } from '../auth/auth.guard';

// Constants
import { SOCKET_GATEWAY } from '@app/constants';
import { JwtService } from '@nestjs/jwt';

// Services
import { NotificationService } from './notification.service';

// Decorators
import { jwtConstants } from '../auth/constants';
import { UserRequest } from '@app/types';

@UseGuards(AuthGuard)
@WebSocketGateway(4000, {
  namespace: SOCKET_GATEWAY.NAMESPACE.NOTIFICATION,
  cors: {
    origin: SOCKET_GATEWAY.CORS.ORIGIN,
    methods: SOCKET_GATEWAY.CORS.METHODS,
    allowedHeaders: SOCKET_GATEWAY.CORS.ALLOWED_HEADERS,
  },
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly notificationService: NotificationService,
  ) {}

  //@RequiresPermission(ROLE., OBJECT_TYPE.BOARD)
  async handleConnection(client: Socket) {
    //const object = client.handshake.query[SOCKET_QUERY_KEY.OBJECT];
    const [type, token] =
      client.handshake.headers['authorization']?.split(' ') ?? [];
    if (type === 'Bearer') {
      try {
        const payload: UserRequest = await this.jwtService.verifyAsync(token, {
          secret: jwtConstants.secret,
        });
        client.join(payload.id);
      } catch {}
    }
  }

  handleDisconnect(client: Socket) {
    //console.log(`Client disconnected: ${client.id}`);
  }
}
