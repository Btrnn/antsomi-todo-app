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
// Types
import { IdentifyId, UserRequest } from '@app/types';

// Decorators
import { User } from '@app/decorators';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import { OBJECT_TYPE, PARAM_KEY, ROLE, ROUTES } from '@app/constants';

// DTOs
import { BoardCreateDto, BoardUpdateDto } from './dto';

@Controller(ROUTES.BOARD)
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  //@RequiresPermission(ROLE.VIEWER)
  @Get('/list')
  getAllBoards(@User() user: UserRequest) {
    return this.boardService.findOwnedAndShared(user.id);
  }

  @Post('/create')
  createBoard(@Body() newBoard: BoardCreateDto, @User() user: UserRequest) {
    return this.boardService.createBoard({
      ...newBoard,
      owner_id: user.id,
    });
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Put(`:${PARAM_KEY.OBJECT}`)
  updateBoard(
    @Param(PARAM_KEY.OBJECT) board_id: IdentifyId,
    @Body() board: BoardUpdateDto,
  ) {
    return this.boardService.updateBoard(board_id, board);
  }

  @RequiresPermission(ROLE.OWNER, OBJECT_TYPE.BOARD)
  @Delete(`:${PARAM_KEY.OBJECT}`)
  deleteBoard(@Param(PARAM_KEY.OBJECT) id: IdentifyId) {
    return this.boardService.deleteBoard(id);
  }

  // @RequiresPermission(ROLE.OWNER, PARAM_KEY.OBJECT)
  // @Get()
  // getAllBoards() {
  //   return this.boardService.findAll();
  // }

  // @RequiresPermission(ROLE.VIEWER)
  // @Get(`/accessList/:${PARAM_KEY.OBJECT}/:${PARAM_KEY.TYPE}`)
  // getUserAccessList(@Param(PARAM_KEY.OBJECT) boardID: IdentifyId) {
  //   return this.boardService.findUserAccessList(boardID);
  // }

  // @RequiresPermission(ROLE.VIEWER)
  // @Post(`/share/:${PARAM_KEY.OBJECT}/:${PARAM_KEY.TYPE}`)
  // shareBoard(
  //   @Param(PARAM_KEY.OBJECT) board_id: IdentifyId,
  //   @Body() shareData: ShareAccessDto,
  //   @User() user: UserRequest,
  // ) {
  //   return this.boardService.shareBoard(
  //     board_id,
  //     shareData.permissionList,
  //     user.id,
  //   );
  // }

  // @RequiresPermission(ROLE.EDITOR)
  // @Put(`/updateAccess/:${PARAM_KEY.OBJECT}/:${PARAM_KEY.TYPE}`)
  // updateBoardAccess(
  //   @Param(PARAM_KEY.OBJECT) board_id: IdentifyId,
  //   @Body() updateData: UpdateAccessDto,
  //   @User() user: UserRequest,
  // ) {
  //   return this.boardService.updateAccessBoard(
  //     board_id,
  //     updateData.permissionList,
  //     user.id,
  //   );
  // }

  // @RequiresPermission(ROLE.EDITOR)
  // @Delete(`deleteAccess/:${PARAM_KEY.OBJECT}`)
  // deleteAccessBoard(
  //   @Param(PARAM_KEY.OBJECT) boardId: IdentifyId,
  //   @Body() deleteData: DeleteAccessDto,
  // ) {
  //   return this.accessService.deleteAccess(boardId, deleteData.user_id);
  // }

  // @RequiresPermission(ROLE.OWNER)
  // @Put(`changeOwner/:${PARAM_KEY.OBJECT}`)
  // changeBoardOwner(
  //   @Param(PARAM_KEY.OBJECT) board_id: IdentifyId,
  //   @Body() changeData: ChangeOwnerDto,
  //   @User() current_owner: UserRequest,
  // ) {
  //   return this.boardService.changeBoardOwner(
  //     board_id,
  //     changeData.new_owner,
  //     current_owner.id,
  //   );
  // }

  // @RequiresPermission(ROLE.EDITOR, PARAM_KEY.OBJECT)
  // @Patch()
  // async updateBoardPositions(
  //   @Body() boardPositions: { id: string; position: number }[],
  // ) {
  //   return this.boardService.reorderBoard(boardPositions);
  // }
}
