// Libraries
import { JwtService } from '@nestjs/jwt';
import {
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Inject, UseGuards } from '@nestjs/common';

// Constants
import {
  SOCKET_GATEWAY,
  OBJECT_TYPE,
  ROLE,
  SOCKET_COMMENT_CHANEL,
  SOCKET_QUERY_KEY,
} from '@app/constants';

// Decorators
import { Object, User, RequiresPermission } from '@app/decorators';

// Types
import { ObjectRequest, UserRequest } from '@app/types';

// Services
import { CommentService } from './comment.service';

// DTOs
import { CommentCreateDto, CommentDeleteDto, CommentEditDto } from './dto';

// Guards
import { AuthGuard } from '../auth/auth.guard';

@UseGuards(AuthGuard)
@WebSocketGateway(4000, {
  namespace: SOCKET_GATEWAY.NAMESPACE.COMMENT,
  cors: {
    origin: SOCKET_GATEWAY.CORS.ORIGIN,
    methods: SOCKET_GATEWAY.CORS.METHODS,
    allowedHeaders: SOCKET_GATEWAY.CORS.ALLOWED_HEADERS,
  },
})
export class CommentGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly commentService: CommentService,
  ) {}

  @RequiresPermission(ROLE.COMMENTER, OBJECT_TYPE.BOARD)
  @SubscribeMessage(SOCKET_COMMENT_CHANEL.CREATE_COMMENT)
  async createComment(
    @MessageBody()
    data: CommentCreateDto,
    @User() user: UserRequest,
    @Object() object: ObjectRequest,
  ) {
    const result = await this.commentService.createComment({
      ...data,
      user_id: user.id,
      object_id: object.id,
      object_type: object.type,
    });
    this.server
      .to(object.id)
      .emit(SOCKET_COMMENT_CHANEL.COMMENT_CREATED, result.data);
  }

  @SubscribeMessage(SOCKET_COMMENT_CHANEL.DELETE_COMMENT)
  async deleteComment(@MessageBody() data: CommentDeleteDto) {
    const result = await this.commentService.deleteComment(data.id);

    if (result.data) {
      this.server.emit(SOCKET_COMMENT_CHANEL.COMMENT_DELETED, data.id);
    }
  }

  @SubscribeMessage(SOCKET_COMMENT_CHANEL.EDIT_COMMENT)
  async editComment(
    @MessageBody()
    data: CommentEditDto,
    @Object() object: ObjectRequest,
  ) {
    const result = await this.commentService.updateComment(data);
    if (result.data) {
      this.server
        .to(object.id)
        .emit(SOCKET_COMMENT_CHANEL.COMMENT_EDITED, data);
    }
  }

  @RequiresPermission(ROLE.VIEWER, OBJECT_TYPE.BOARD)
  async handleConnection(client: Socket) {
    const object = client.handshake.query[SOCKET_QUERY_KEY.OBJECT];
    if (object) {
      const chanel = JSON.parse(object as string).id;
      client.join(chanel);
    }
  }

  handleDisconnect(client: Socket) {
    //console.log(`Client disconnected: ${client.id}`);
  }
}
