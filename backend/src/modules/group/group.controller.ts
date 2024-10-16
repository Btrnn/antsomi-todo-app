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
import { ACCESS_OBJECT } from '@app/constants';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @RequiresPermission('VIEW', ACCESS_OBJECT.BOARD)
  @Get(`:${ACCESS_OBJECT.BOARD}`)
  getAllGroups(@Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId) {
    return this.groupService.findAll(board_id);
  }

  @RequiresPermission('EDIT', ACCESS_OBJECT.BOARD)
  @Put(`:${ACCESS_OBJECT.BOARD}`)
  update(
    @Body() group: { id: IdentifyId; groupUpdated: Partial<GroupEntity> },
  ) {
    return this.groupService.updateGroup(group.id, group.groupUpdated);
  }

  @RequiresPermission('EDIT', ACCESS_OBJECT.BOARD)
  @Post(`:${ACCESS_OBJECT.BOARD}`)
  createGroup(
    @Body() newGroup: Omit<GroupEntity, 'id' | 'owner_id'>,
    @User() user: UserEntity,
  ) {
    return this.groupService.createGroup(user.id, {
      ...newGroup,
      owner_id: user.id,
    });
  }

  @RequiresPermission('EDIT', ACCESS_OBJECT.BOARD)
  @Delete(`:${ACCESS_OBJECT.BOARD}`)
  deleteGroup(@Body('id') id: IdentifyId) {
    return this.groupService.deleteGroup(id);
  }

  @RequiresPermission('EDIT', ACCESS_OBJECT.BOARD)
  @Patch(`:${ACCESS_OBJECT.BOARD}`)
  async updateGroupPositions(
    @Param('board_id') board_id: IdentifyId,
    @Body() groupPositions: { id: string; position: number }[],
    @User() user: UserEntity,
  ) {
    return this.groupService.reorderGroup(board_id, user.id, groupPositions);
  }
}