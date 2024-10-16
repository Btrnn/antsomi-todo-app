// Libraries
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';

// Services
import { BoardService } from './board.service';

// Entities
import { UserEntity } from '../user/user.entity';
import { BoardEntity } from './board.entity';

// Decorators
import { User } from '@app/decorators';
import { IdentifyId } from '@app/types';
import { AccessService } from '../share_access/share_access.service';
import { ACCESS_OBJECT } from '@app/constants';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

@Controller('board')
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly accessService: AccessService,
  ) {}

  @Get('/owned')
  getOwnedBoards(@User() user: UserEntity) {
    return this.boardService.findOwned(user.id);
  }

  @Get('/shared')
  getSharedBoards(@User() user: UserEntity) {
    return this.boardService.findShared(user.id);
  }

  @RequiresPermission('VIEW', ACCESS_OBJECT.BOARD)
  @Get(`/permission/:${ACCESS_OBJECT.BOARD}`)
  getBoardPermission(
    @User() user: UserEntity,
    @Param(ACCESS_OBJECT.BOARD) boardID: IdentifyId,
  ) {
    return this.boardService.findPermission(user.id, boardID);
  }

  @RequiresPermission('VIEW', ACCESS_OBJECT.BOARD)
  @Get(`/accessList/:${ACCESS_OBJECT.BOARD}`)
  getUserAccessList(
    @User() user: UserEntity,
    @Param(ACCESS_OBJECT.BOARD) boardID: IdentifyId,
  ) {
    return this.boardService.findUserAccessList(boardID);
  }

  @Post('/create')
  createBoard(
    @Body() newBoard: Omit<BoardEntity, 'id'>,
    @User() user: UserEntity,
  ) {
    return this.boardService.createBoard({
      ...newBoard,
      owner_id: user.id,
    });
  }

  @RequiresPermission('EDIT', ACCESS_OBJECT.BOARD)
  @Post(`/share/:${ACCESS_OBJECT.BOARD}`)
  shareBoard(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body() user_permission: { user_id: IdentifyId; permission: string }[],
  ) {
    return this.boardService.shareBoard(board_id, user_permission);
  }

  @RequiresPermission('EDIT', ACCESS_OBJECT.BOARD)
  @Put(`:${ACCESS_OBJECT.BOARD}`)
  updateBoard(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body() board: Partial<BoardEntity>,
  ) {
    return this.boardService.updateBoard(board_id, board);
  }

  @RequiresPermission('OWN', ACCESS_OBJECT.BOARD)
  @Put(`/updateAccess/:${ACCESS_OBJECT.BOARD}`)
  updateBoardAccess(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body() accessList: { user_id: IdentifyId; permission: string }[],
  ) {
    return this.boardService.updateAccessBoard(board_id, accessList);
  }

  @RequiresPermission('MANAGE', ACCESS_OBJECT.BOARD)
  @Delete(`:${ACCESS_OBJECT.BOARD}`)
  deleteBoard(
    @Param(ACCESS_OBJECT.BOARD) id: IdentifyId,
    @User() user: UserEntity,
  ) {
    return this.boardService.deleteBoard(id, user.id);
  }

  @RequiresPermission('MANAGE', ACCESS_OBJECT.BOARD)
  @Delete(`deleteAccess/:${ACCESS_OBJECT.BOARD}`)
  deleteAccessBoard(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body('userID') user_id: IdentifyId,
  ) {
    return this.accessService.deleteAccess(board_id, user_id);
  }

  @RequiresPermission('OWN', ACCESS_OBJECT.BOARD)
  @Put(`changeOwner/:${ACCESS_OBJECT.BOARD}`)
  changeBoardOwner(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body('new_owner') new_owner_id: IdentifyId,
    @User() current_owner: UserEntity,
  ) {
    console.log('🚀 ~ BoardController ~ current_owner:', current_owner);
    console.log('🚀 ~ BoardController ~ new_owner_id:', new_owner_id);
    console.log('🚀 ~ BoardController ~ board_id:', board_id);

    return this.boardService.changeBoardOwner(
      board_id,
      new_owner_id,
      current_owner.id,
    );
  }

  @RequiresPermission('EDIT', ACCESS_OBJECT.BOARD)
  @Patch()
  async updateBoardPositions(
    @Body() boardPositions: { id: string; position: number }[],
  ) {
    return this.boardService.reorderBoard(boardPositions);
  }
}
