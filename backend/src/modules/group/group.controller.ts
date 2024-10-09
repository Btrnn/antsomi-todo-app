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
  Header,
  Req,
  Query,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

// Entities
import { GroupEntity } from './group.entity';
import { UserEntity } from '../user/user.entity';

// Services
import { GroupService } from './group.service';

// Types
import { IdentifyId, UserRequest } from '@app/types';

// Decorators
import { User } from '@app/decorators';

@Controller('group')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Get()
  getAllGroups(@User() user: UserEntity) {
    return this.groupService.findAll(user.id);
  }

  // @Get(':id')
  // getGroupById(@Param('id') id: IdentifyId) {
  //   return this.groupService.findOne(id);
  // }

  @Put(':id')
  update(
    @Param('id') id: IdentifyId,
    @Body() group: Partial<GroupEntity>,
    @User() user: UserEntity,
  ) {
    return this.groupService.updateGroup(id, group, user.id);
  }

  @Post()
  createGroup(@Body() newGroup: GroupEntity, @User() user: UserEntity) {
    return this.groupService.createGroup({
      ...newGroup,
      owner_id: user.id,
    });
  }

  @Delete(':id')
  deleteGroup(@Param('id') id: IdentifyId, @User() user: UserEntity) {
    return this.groupService.deleteGroup(id, user.id);
  }

  @Patch()
  async updateGroupPositions(
    @Body() groupPositions: { id: string; position: number }[],
  ) {
    return this.groupService.reorderGroup(groupPositions);
  }
}
