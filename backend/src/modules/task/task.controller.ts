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
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import { ACCESS_OBJECT, ROLE, ROUTES } from '@app/constants';

@Controller(ROUTES.TASK)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
  @Get(`:${ACCESS_OBJECT.BOARD}`)
  getAllTasks(
    @Param(ACCESS_OBJECT.BOARD) boardID: IdentifyId,
    @User() user: UserEntity,
  ) {
    return this.taskService.findAll(user.id, boardID);
  }

  // @Get(':id')
  // getTaskById(@Param('id') id: IdentifyId) {
  //   return this.taskService.findOne(id);
  // }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Put(`:${ACCESS_OBJECT.BOARD}`)
  update(@Body() task: Partial<TaskEntity>) {
    return this.taskService.updateTask(task.id, task);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Post(`:${ACCESS_OBJECT.BOARD}`)
  createTask(
    @Body() newTask: Omit<TaskEntity, 'id'>,
    @User() user: UserEntity,
  ) {
    return this.taskService.createTask({
      ...newTask,
      owner_id: user.id,
    });
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Delete(`:${ACCESS_OBJECT.BOARD}`)
  deleteTask(
    @Param('boardID') boardID: IdentifyId,
    @Body('id') id: IdentifyId,
    @User() user: UserEntity,
  ) {
    return this.taskService.deleteTask(boardID, id, user.id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Delete(`clear/:${ACCESS_OBJECT.BOARD}`)
  deleteTaskByGroupID(@Body('id') id: IdentifyId) {
    return this.taskService.deleteTaskByGroupID(id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Patch(`reorder/:${ACCESS_OBJECT.BOARD}`)
  async updateTaskPositions(
    @Body() taskPositions: { id: string; position: number }[],
    @User() user: UserEntity,
  ) {
    return this.taskService.reorderTask(taskPositions, user.id);
  }
}
