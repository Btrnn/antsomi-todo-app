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

// Entities
import { GroupEntity } from './group.entity';
import { UserEntity } from '../user/user.entity';

// Services
import { GroupService } from './group.service';

// Types
import { IdentifyId } from '@app/types';

// Decorators
import { User } from '@app/decorators';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import { ACCESS_OBJECT, ROLE, ROUTES } from '@app/constants';
import {
  GroupCreateDto,
  GroupDeleteDto,
  GroupReorderDto,
  GroupUpdateDto,
} from './dto';

@Controller(ROUTES.GROUP)
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
  @Get(`:${ACCESS_OBJECT.BOARD}`)
  getAllGroups(@Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId) {
    return this.groupService.findAll(board_id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Put(`:${ACCESS_OBJECT.BOARD}`)
  updateGroup(@Body() updateData: GroupUpdateDto) {
    const { id, ...restOfData } = updateData;
    return this.groupService.updateGroup(id, restOfData);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Post(`:${ACCESS_OBJECT.BOARD}`)
  createGroup(
    @Param(ACCESS_OBJECT.BOARD) board: IdentifyId,
    @Body() createData: GroupCreateDto,
    @User() user: UserEntity,
  ) {
    return this.groupService.createGroup({
      ...createData,
      owner_id: user.id,
      board_id: board as string,
    });
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Delete(`:${ACCESS_OBJECT.BOARD}`)
  deleteGroup(@Body() deleteData: GroupDeleteDto) {
    return this.groupService.deleteGroup(deleteData.id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Patch(`reorder/:${ACCESS_OBJECT.BOARD}`)
  async updateGroupPositions(@Body() reorderData: GroupReorderDto) {
    return this.groupService.reorderGroup(reorderData.positionList);
  }
}
