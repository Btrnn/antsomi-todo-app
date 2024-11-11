// Libraries
import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  Patch,
} from '@nestjs/common';

// Services
import { GroupService } from './group.service';

// Types
import { IdentifyId, UserRequest } from '@app/types';

// Decorators
import { User } from '@app/decorators';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import { OBJECT_TYPE, PARAM_KEY, ROLE, ROUTES } from '@app/constants';

// DTOs
import {
  GroupCreateDto,
  GroupDeleteDto,
  GroupReorderDto,
  GroupUpdateDto,
} from './dto';

@Controller(ROUTES.GROUP)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @RequiresPermission(ROLE.VIEWER, OBJECT_TYPE.BOARD)
  @Get(`:${PARAM_KEY.OBJECT}`)
  getAllGroups(@Param(PARAM_KEY.OBJECT) board_id: IdentifyId) {
    return this.groupService.findAll(board_id);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Put(`:${PARAM_KEY.OBJECT}`)
  updateGroup(@Body() updateData: GroupUpdateDto) {
    const { id, ...restOfData } = updateData;
    return this.groupService.updateGroup(id, restOfData);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Post(`:${PARAM_KEY.OBJECT}`)
  createGroup(
    @Param(PARAM_KEY.OBJECT) board: IdentifyId,
    @Body() createData: GroupCreateDto,
    @User() user: UserRequest,
  ) {
    return this.groupService.createGroup({
      ...createData,
      owner_id: user.id,
      board_id: board as string,
    });
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Delete(`:${PARAM_KEY.OBJECT}`)
  deleteGroup(@Body() deleteData: GroupDeleteDto) {
    return this.groupService.deleteGroup(deleteData.id);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Patch(`reorder/:${PARAM_KEY.OBJECT}`)
  async updateGroupPositions(@Body() reorderData: GroupReorderDto) {
    return this.groupService.reorderGroup(reorderData.positionList);
  }
}
