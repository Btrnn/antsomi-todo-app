// Libraries
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { HttpException, HttpStatus, UseGuards } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

// Guards
import { AuthGuard } from '../auth/auth.guard';

// Constants
import {
  SOCKET_GATEWAY,
  SOCKET_NOTIFICATION_CHANEL,
  SOCKET_QUERY_KEY,
} from '@app/constants';
import { JwtService } from '@nestjs/jwt';

// Services
import { NotificationService } from './notification.service';

// Decorators
import { RequiresPermission } from '@app/decorators';
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

  // @RequiresPermission(ROLE.COMMENTER, OBJECT_TYPE.BOARD)
  // @SubscribeMessage(SOCKET_COMMENT_CHANEL.CREATE_COMMENT)
  // async createComment(
  //   @MessageBody()
  //   data: CommentCreateDto,
  //   @User() user: UserRequest,
  //   @Object() object: ObjectRequest,
  // ) {
  //   const result = await this.commentService.createComment({
  //     ...data,
  //     user_id: user.id,
  //     object_id: object.id,
  //     object_type: object.type,
  //   });
  //   this.server.to(object.id).emit(SOCKET_COMMENT_CHANEL.COMMENT_CREATED, result.data);
  // }

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
      } catch {
        // throw new HttpException(
        //   {
        //     statusCode: HttpStatus.UNAUTHORIZED,
        //     statusMessage:
        //       'Your session has expired. Please log in again to continue.',
        //   },
        //   HttpStatus.UNAUTHORIZED,
        // );
      }
    }
  }

  handleDisconnect(client: Socket) {
    //console.log(`Client disconnected: ${client.id}`);
  }
}
