// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Entities
import { GroupEntity } from '../group/group.entity';
import { TaskEntity } from '../task/task.entity';
import { BoardEntity } from './board.entity';

// Repository
import { BoardRepository } from './board.repository';

// Services
import { AccessService } from '../share_access/share_access.service';
import { AuthService } from '../auth/auth.service';
import { GroupService } from '../group/group.service';
import { ACCESS_OBJECT, OBJECT_TYPE } from '@app/constants';
import { UserEntity } from '../user/user.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity)
    private readonly boardRepository: BoardRepository,
    private readonly accessService: AccessService,
    private readonly authService: AuthService,
    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
  ) {}

  async findOwned(userID: IdentifyId): Promise<ServiceResponse<BoardEntity[]>> {
    const entities = await this.boardRepository.find({
      where: {
        owner_id: userID as string,
      },
      order: {
        position: {
          direction: 'ASC',
        },
      },
    });
    return { data: entities, meta: { page: 1 } };
  }

  async findShared(
    userID: IdentifyId,
  ): Promise<ServiceResponse<BoardEntity[]>> {
    const boardIDs = await this.accessService.findBoardsByUser(userID);
    const entities = await this.boardRepository.find({
      where: {
        id: In(boardIDs.data),
      },
      order: {
        created_at: {
          direction: 'ASC',
        },
      },
    });
    if (entities.length === 0) {
      return { data: [], meta: {} };
    }
    return { data: entities, meta: { page: 1 } };
  }

  async findPermission(
    userID: IdentifyId,
    boardID: IdentifyId,
  ): Promise<ServiceResponse<string>> {
    const currentBoard = await this.boardRepository.findOneBy({
      id: boardID as string,
    });
    if (currentBoard.owner_id === (userID as string)) {
      return { data: 'owner', meta: {} };
    }
    const result = await this.accessService.findUserPermission(
      userID,
      boardID,
      OBJECT_TYPE.BOARD,
    );
    return { data: result.data, meta: {} };
  }

  async createBoard(
    board: Omit<BoardEntity, 'id'>,
  ): Promise<ServiceResponse<BoardEntity>> {
    const entity = await this.boardRepository
      .createQueryBuilder()
      .insert()
      .into(BoardEntity)
      .values(board)
      .returning('*')
      .execute();
    return { data: entity.raw, meta: {} };
  }

  async shareBoard(
    board_id: IdentifyId,
    user_permission: { user_id: IdentifyId; permission: string }[],
  ): Promise<ServiceResponse<boolean>> {
    for (const permission of user_permission) {
      await this.accessService.createAccess({
        object_id: board_id as string,
        user_id: permission.user_id as string,
        permission: permission.permission,
        object_type: OBJECT_TYPE.BOARD,
      });
    }
    return { data: true, meta: {} };
  }

  async updateAccessBoard(
    board_id: IdentifyId,
    accessList: { user_id: IdentifyId; permission: string }[],
  ): Promise<ServiceResponse<boolean>> {
    const entity = await this.accessService.updateAccess(
      board_id,
      OBJECT_TYPE.BOARD,
      accessList,
    );
    return { data: entity.data, meta: {} };
  }

  async findUserAccessList(
    board_id: IdentifyId,
  ): Promise<
    ServiceResponse<
      { id: string; name: string; email: string; permission: string }[]
    >
  > {
    const userAccessList =
      await this.accessService.findUserAccessListByObjectId(
        board_id,
        OBJECT_TYPE.BOARD,
      );
    const userIDs = userAccessList.data.map((user) => user.id);
    const users = await this.dataSource.manager.find(UserEntity, {
      where: {
        id: In(userIDs),
      },
    });
    const userDetails = users.map((user) => {
      const permission = userAccessList.data.find(
        (u) => u.id === user.id,
      )?.permission;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        permission,
      };
    });
    return { data: userDetails, meta: {} };
  }

  async deleteBoard(
    board_id: IdentifyId,
    user_id: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    await this.dataSource.transaction(async (manager) => {
      const group_list = await manager.find(GroupEntity, {
        select: ['id'],
        where: { board_id: board_id as string },
      });
      for (const groupID of group_list) {
        await this.groupService.deleteGroup(groupID.id);
      }
      const result = await manager.delete(BoardEntity, { id: board_id });
      return { data: result.affected > 0, meta: {} };
    });
    // const result = await this.boardRepository.delete
    return {
      data: false,
      meta: {},
    };
  }

  async updateBoard(
    boardID: IdentifyId,
    updateData: Partial<BoardEntity>,
  ): Promise<ServiceResponse<boolean>> {
    const result = await this.boardRepository
      .createQueryBuilder()
      .update(BoardEntity)
      .set(updateData)
      .where('id = :id', { id: boardID })
      .returning('*')
      .execute();
    return { data: result.affected > 0, meta: {} };
  }

  async reorderBoard(
    boardsPosition: { id: string; position: number }[],
  ): Promise<ServiceResponse<boolean>> {
    for (const { id, position } of boardsPosition) {
      await this.boardRepository.update({ id }, { position });
    }
    return { data: true, meta: {} };
  }
}
