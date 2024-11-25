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
import { Inject } from '@nestjs/common';

// Constants
import { jwtConstants } from '../auth/constants';
import { SOCKET_CHANEL, SOCKET_QUERY_KEY } from '@app/constants';

// Decorators
import { Object, User } from '@app/decorators';

// Types
import { ObjectRequest, UserRequest } from '@app/types';

// Services
import { CommentService } from './comment.service';

// Entity
import { CommentEntity } from './comment.entity';

// DTOs
import { CommentCreateDto, CommentDeleteDto } from './dto';

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
    data: Pick<CommentEntity, 'id' | 'updated_at' | 'content'>,
    @Object() object: ObjectRequest,
  ) {
    const result = await this.commentService.updateComment(data);
    if (result.data) {
      this.server.to(object.id).emit(SOCKET_CHANEL.COMMENT_EDITED, data);
    }
  }

  async handleConnection(client: Socket) {
    const [type, token] =
      client.handshake.headers['authorization']?.split(' ') ?? [];
    if (type !== 'Bearer' || !token) {
      client.disconnect();
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });
      client['user'] = payload;

      const object = client.handshake.query[SOCKET_QUERY_KEY.OBJECT];
      const chanel = JSON.parse(object as string).id;
      client.join(chanel);
    } catch {
      client.disconnect();
      return;
      //throw new WsException('Invalid credentials.');
    }

    //console.log(`Client connected: ${client.id}`);
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
