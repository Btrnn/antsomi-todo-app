// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource, In } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Entities
import { GroupEntity } from '../group/group.entity';
import { BoardEntity } from './board.entity';

// Repository
import { BoardRepository } from './board.repository';

// Services
import { AccessService } from '../share_access/share_access.service';
import { GroupService } from '../group/group.service';
import { OBJECT_TYPE, PERMISSION, ROLE } from '@app/constants';
import { UserEntity } from '../user/user.entity';
import { AccessEntity } from '../share_access/share_access.entity';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity)
    private readonly boardRepository: BoardRepository,
    private readonly accessService: AccessService,
    private readonly groupService: GroupService,
    private readonly dataSource: DataSource,
  ) {}

  // async findAll(): Promise<ServiceResponse<BoardEntity[]>> {
  //   const entities = await this.boardRepository.find();
  //   return {
  //     data: entities,
  //     meta: { page: 1 },
  //   };
  // }

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
    const boardIDs = await this.accessService.findObjectsByUser(
      userID,
      OBJECT_TYPE.BOARD,
    );

    if (boardIDs.data.length === 0) {
      return { data: [], meta: {} };
    }

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

  async findOwnedAndShared(
    userID: IdentifyId,
  ): Promise<ServiceResponse<{ shared: BoardEntity[]; owned: BoardEntity[] }>> {
    const owned = await this.findOwned(userID);
    const shared = await this.findShared(userID);
    return {
      data: { owned: owned.data || [], shared: shared.data || [] },
      meta: { page: 1 },
    };
  }

  async createBoard(
    board: Omit<BoardEntity, 'id' | 'created_at'>,
  ): Promise<ServiceResponse<BoardEntity>> {
    const entity = await this.boardRepository.save(board);
    return { data: entity ? entity : null, meta: {} };
  }

  async deleteBoard(board_id: IdentifyId): Promise<ServiceResponse<boolean>> {
    let resultDelete = false;
    await this.dataSource.transaction(async (manager) => {
      const group_list = await manager.find(GroupEntity, {
        select: ['id'],
        where: { board_id: board_id as string },
      });
      for (const group of group_list) {
        await this.groupService.deleteGroup(group.id);
      }
      await manager.delete(AccessEntity, {
        object_id: board_id as string,
      });
      const result = await this.boardRepository.delete({
        id: board_id as string,
      });
      if (result.affected > 0) {
        resultDelete = true;
      }
    });
    return {
      data: resultDelete,
      meta: {},
    };
  }

  async updateBoard(
    id: IdentifyId,
    updateData: Partial<BoardEntity>,
  ): Promise<ServiceResponse<boolean>> {
    const result = await this.boardRepository.update(
      { id: id as string },
      updateData,
    );
    return { data: result.affected > 0, meta: {} };
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
    const result = await this.accessService.findUserPermission(userID, boardID);
    return { data: result.data, meta: {} };
  }

  // async shareBoard(
  //   board_id: IdentifyId,
  //   user_permission: { user_id: IdentifyId; permission: string }[],
  //   user_id: IdentifyId,
  // ): Promise<ServiceResponse<boolean>> {
  //   const current_board = await this.boardRepository.findOneBy({
  //     id: board_id as string,
  //   });

  //   let current_permission;
  //   if (current_board.owner_id === user_id) {
  //     current_permission = ROLE.OWNER;
  //   } else {
  //     current_permission = await this.accessService.findUserPermission(
  //       user_id,
  //       board_id,
  //     );
  //     current_permission = current_permission.data;
  //   }

  //   for (const permission of user_permission) {
  //     if (current_board.owner_id === permission.user_id) {
  //       throw new HttpException(
  //         {
  //           statusCode: HttpStatus.CONFLICT,
  //           statusMessage: 'Cannot share board with owner',
  //         },
  //         HttpStatus.CONFLICT,
  //       );
  //     }
  //     if (!PERMISSION[permission.permission].includes(current_permission)) {
  //       throw new HttpException(
  //         {
  //           statusCode: HttpStatus.UNAUTHORIZED,
  //           statusMessage: 'Cannot share access with higher permission',
  //         },
  //         HttpStatus.UNAUTHORIZED,
  //       );
  //     }
  //     // await this.accessService.createAccess({
  //     //   object_id: board_id as string,
  //     //   user_id: permission.user_id as string,
  //     //   permission: permission.permission,
  //     //   object_type: OBJECT_TYPE.BOARD,
  //     // });
  //   }
  //   return { data: true, meta: {} };
  // }

  // async updateAccessBoard(
  //   board_id: IdentifyId,
  //   accessList: { user_id: IdentifyId; permission: string }[],
  //   user_id: IdentifyId,
  // ): Promise<ServiceResponse<boolean>> {
  //   const entity = await this.accessService.updateAccess(
  //     board_id,
  //     OBJECT_TYPE.BOARD,
  //     accessList,
  //     user_id,
  //   );
  //   return { data: entity.data, meta: {} };
  // }

  // async changeBoardOwner(
  //   board_id: IdentifyId,
  //   new_owner_id: IdentifyId,
  //   current_owner_id: IdentifyId,
  // ): Promise<ServiceResponse<boolean>> {
  //   const entity = await this.boardRepository
  //     .createQueryBuilder()
  //     .update(BoardEntity)
  //     .set({ owner_id: new_owner_id as string })
  //     .where('id = :id', { id: board_id })
  //     .returning('*')
  //     .execute();

  //   if (entity.affected !== 0) {
  //     await this.accessService.deleteAccess(board_id, new_owner_id);
  //     // await this.accessService.createAccess({
  //     //   object_id: board_id as string,
  //     //   user_id: current_owner_id as string,
  //     //   permission: ROLE.EDITOR,
  //     //   object_type: OBJECT_TYPE.BOARD,
  //     // });
  //   }
  //   return { data: entity.affected > 0, meta: {} };
  // }

  // async reorderBoard(
  //   boardsPosition: { id: string; position: number }[],
  // ): Promise<ServiceResponse<boolean>> {
  //   for (const { id, position } of boardsPosition) {
  //     await this.boardRepository.update({ id }, { position });
  //   }
  //   return { data: true, meta: {} };
  // }
}
