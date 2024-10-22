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
import { AccessService } from '../share_access/share_access.service';

// Entities
import { UserEntity } from '../user/user.entity';
import { BoardEntity } from './board.entity';

// Types
import { IdentifyId } from '@app/types';

// Decorators
import { User } from '@app/decorators';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import { ACCESS_OBJECT, ROLE, ROUTES } from '@app/constants';

@Controller(ROUTES.BOARD)
export class BoardController {
  constructor(
    private readonly boardService: BoardService,
    private readonly accessService: AccessService,
  ) {}

  @Get('/owned')
  getOwnedBoards(@User() user: UserEntity) {
    return this.boardService.findOwned(user.id);
  }

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
  @Get()
  getAllBoards(@User() user: UserEntity) {
    return this.boardService.findAll(user.id);
  }

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
  @Get(`/permission/:${ACCESS_OBJECT.BOARD}`)
  getBoardPermission(
    @User() user: UserEntity,
    @Param(ACCESS_OBJECT.BOARD) boardID: IdentifyId,
  ) {
    return this.boardService.findPermission(user.id, boardID);
  }

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
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

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
  @Post(`/share/:${ACCESS_OBJECT.BOARD}`)
  shareBoard(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body() user_permission: { user_id: IdentifyId; permission: string }[],
    @User() user: UserEntity,
  ) {
    return this.boardService.shareBoard(board_id, user_permission, user.id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Put(`:${ACCESS_OBJECT.BOARD}`)
  updateBoard(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body() board: Partial<BoardEntity>,
  ) {
    return this.boardService.updateBoard(board_id, board);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Put(`/updateAccess/:${ACCESS_OBJECT.BOARD}`)
  updateBoardAccess(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body() accessList: { user_id: IdentifyId; permission: string }[],
    @User() user: UserEntity,
  ) {
    return this.boardService.updateAccessBoard(board_id, accessList, user.id);
  }

  @RequiresPermission(ROLE.MANAGER, ACCESS_OBJECT.BOARD)
  @Delete(`:${ACCESS_OBJECT.BOARD}`)
  deleteBoard(
    @Param(ACCESS_OBJECT.BOARD) id: IdentifyId,
    @User() user: UserEntity,
  ) {
    return this.boardService.deleteBoard(id, user.id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Delete(`deleteAccess/:${ACCESS_OBJECT.BOARD}`)
  deleteAccessBoard(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body('userID') user_id: IdentifyId,
  ) {
    return this.accessService.deleteAccess(board_id, user_id);
  }

  @RequiresPermission(ROLE.OWNER, ACCESS_OBJECT.BOARD)
  @Put(`changeOwner/:${ACCESS_OBJECT.BOARD}`)
  changeBoardOwner(
    @Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId,
    @Body('new_owner') new_owner_id: IdentifyId,
    @User() current_owner: UserEntity,
  ) {
    return this.boardService.changeBoardOwner(
      board_id,
      new_owner_id,
      current_owner.id,
    );
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Patch()
  async updateBoardPositions(
    @Body() boardPositions: { id: string; position: number }[],
  ) {
    return this.boardService.reorderBoard(boardPositions);
  }
}
