// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { IdentifyId, ServiceResponse } from '@app/types';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

// Services
import { UserService } from '../user/user.service';
import { AccessService } from '../share_access/share_access.service';
import { BoardEntity } from '../board/board.entity';
import { ACCESS_OBJECT, OBJECT_TYPE, PERMISSION } from '@app/constants';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly boardUserService: AccessService,
    private readonly dataSource: DataSource,
  ) {}

  async signIn(
    username: string,
    password: string,
  ): Promise<ServiceResponse<string>> {
    const user = await this.userService.findByUsername(username);
    if (user.data) {
      const isMatch = await bcrypt.compare(password, user.data.password);
      if (!isMatch) {
        throw new HttpException(
          {
            statusCode: HttpStatus.UNAUTHORIZED,
            statusMessage: 'Wrong password or username!',
          },
          HttpStatus.UNAUTHORIZED,
        );
      }
      const payload = {
        id: user.data.id,
        role: user.data.role,
      };
      const accessToken = await this.jwtService.signAsync(payload);
      return { data: accessToken, meta: {} };
    }
    throw new HttpException(
      {
        statusCode: HttpStatus.UNAUTHORIZED,
        statusMessage: 'Wrong password or username!',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }

  async isAcceptedPermission(
    userID: IdentifyId,
    objectID: IdentifyId,
    permissionActions: string[],
  ): Promise<ServiceResponse<boolean>> {
    const currentBoard = await this.dataSource.manager.findOneBy(BoardEntity, {
      id: objectID as string,
    });
    if (currentBoard.owner_id === (userID as string)) {
      return { data: true, meta: {} };
    }
    const permission = await this.boardUserService.findUserPermission(
      userID,
      objectID,
    );
    if (permissionActions.includes(permission.data)) {
      return { data: true, meta: {} };
    }
    return { data: false, meta: {} };
  }
}
