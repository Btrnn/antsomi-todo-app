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
import { ACCESS_OBJECT, ROLE } from '@app/constants';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
  @Get(`:${ACCESS_OBJECT.BOARD}`)
  getAllGroups(@Param(ACCESS_OBJECT.BOARD) board_id: IdentifyId) {
    return this.groupService.findAll(board_id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Put(`:${ACCESS_OBJECT.BOARD}`)
  update(
    @Body() group: { id: IdentifyId; groupUpdated: Partial<GroupEntity> },
  ) {
    return this.groupService.updateGroup(group.id, group.groupUpdated);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
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

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Delete(`:${ACCESS_OBJECT.BOARD}`)
  deleteGroup(@Body('id') id: IdentifyId) {
    return this.groupService.deleteGroup(id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Patch(`reorder/:${ACCESS_OBJECT.BOARD}`)
  async updateGroupPositions(
    @Body() groupPositions: { id: string; position: number }[],
  ) {
    return this.groupService.reorderGroup(groupPositions);
  }
}
