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
import { jwtConstants } from '../auth/constants';
import {
  OBJECT_TYPE,
  PERMISSION,
  ROLE,
  SOCKET_CHANEL,
  SOCKET_QUERY_KEY,
} from '@app/constants';

// Decorators
import { Object, User } from '@app/decorators';

// Types
import { ObjectRequest, UserRequest } from '@app/types';

// Services
import { CommentService } from './comment.service';

// Entity
import { CommentEntity } from './comment.entity';

// DTOs
import { CommentCreateDto, CommentDeleteDto, CommentEditDto } from './dto';
import { AuthGuard } from '../auth/auth.guard';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

@UseGuards(AuthGuard)
@WebSocketGateway(4000, {
  namespace: 'comment',
  cors: {
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
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
  @SubscribeMessage(SOCKET_CHANEL.CREATE_COMMENT)
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
    this.server.to(object.id).emit(SOCKET_CHANEL.COMMENT_CREATED, result.data);
  }

  @SubscribeMessage(SOCKET_CHANEL.DELETE_COMMENT)
  async deleteComment(@MessageBody() data: CommentDeleteDto) {
    const result = await this.commentService.deleteComment(data.id);

    if (result.data) {
      this.server.emit(SOCKET_CHANEL.COMMENT_DELETED, data.id);
    }
  }

  @SubscribeMessage(SOCKET_CHANEL.EDIT_COMMENT)
  async editComment(
    @MessageBody()
    data: CommentEditDto,
    @Object() object: ObjectRequest,
  ) {
    const result = await this.commentService.updateComment(data);
    if (result.data) {
      this.server.to(object.id).emit(SOCKET_CHANEL.COMMENT_EDITED, data);
    }
  }

  @RequiresPermission(ROLE.VIEWER, OBJECT_TYPE.BOARD)
  async handleConnection(client: Socket) {
    const object = client.handshake.query[SOCKET_QUERY_KEY.OBJECT];
    const chanel = JSON.parse(object as string).id;
    client.join(chanel);
  }

  handleDisconnect(client: Socket) {
    //console.log(`Client disconnected: ${client.id}`);
  }

  // @SubscribeMessage(SOCKET_CHANEL.CHANGE_ROOM)
  // handleChangeRoom(client: Socket, @Object() object: ObjectRequest) {
  //   console.log('🚀 ~ handleChangeRoom ~ object:', object);
  //   console.log('🚀 ~ handleChangeRoom ~ client:', client.rooms);
  //   // client.leave(client.rooms[0]);
  //   // client.join(object.id);
  // }

  // @SubscribeMessage('events')
  // handleEvent(@MessageBody() data: string): string {
  //   console.log(data);
  //   return `Event received: ${data}`;
  // }
}
