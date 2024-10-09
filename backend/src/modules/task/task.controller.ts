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
import { TaskService } from './task.service';

// Types
import { IdentifyId } from '@app/types';

// Entities
import { TaskEntity } from './task.entity';
import { UserEntity } from '../user/user.entity';

// Decorators
import { User } from '@app/decorators';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Get()
  getAllTasks(@User() user: UserEntity) {
    return this.taskService.findAll(user.id);
  }

  // @Get(':id')
  // getTaskById(@Param('id') id: IdentifyId) {
  //   return this.taskService.findOne(id);
  // }

  @Put(':id')
  update(
    @Param('id') id: IdentifyId,
    @Body() task: Partial<TaskEntity>,
    @User() user: UserEntity,
  ) {
    return this.taskService.updateTask(id, task, user.id);
  }

  @Post()
  createTask(
    @Body() newTask: Omit<TaskEntity, 'id'>,
    @User() user: UserEntity,
  ) {
    return this.taskService.createTask({
      ...newTask,
      owner_id: user.id,
    });
  }

  @Delete(':id')
  deleteTask(@Param('id') id: IdentifyId, @User() user: UserEntity) {
    return this.taskService.deleteTask(id, user.id);
  }

  @Delete('clear/:groupID')
  deleteTaskByGroupID(
    @Param('groupID') id: IdentifyId,
    @User() user: UserEntity,
  ) {
    return this.taskService.deleteTaskByGroupID(id, user.id);
  }

  @Patch()
  async updateTaskPositions(
    @Body() taskPositions: { id: string; position: number }[],
    @User() user: UserEntity,
  ) {
    return this.taskService.reorderTask(taskPositions, user.id);
  }
}
