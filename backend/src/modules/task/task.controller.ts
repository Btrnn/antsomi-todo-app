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
import { UserEntity } from '../user/user.entity';

// Decorators
import { User } from '@app/decorators';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import { ACCESS_OBJECT, ROLE, ROUTES } from '@app/constants';

// Dtos
import {
  TaskCreateDto,
  TaskDeleteDto,
  TaskReorderDto,
  TaskUpdateDto,
} from './dto';

@Controller(ROUTES.TASK)
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @RequiresPermission(ROLE.VIEWER, ACCESS_OBJECT.BOARD)
  @Get(`:${ACCESS_OBJECT.BOARD}`)
  getAllTasks(@Param(ACCESS_OBJECT.BOARD) boardID: IdentifyId) {
    return this.taskService.findAll(boardID);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Put(`:${ACCESS_OBJECT.BOARD}`)
  updateTask(@Body() task: TaskUpdateDto) {
    const { id, ...updateData } = task;
    return this.taskService.updateTask(id, updateData);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Post(`:${ACCESS_OBJECT.BOARD}`)
  createTask(@Body() newTask: TaskCreateDto, @User() user: UserEntity) {
    return this.taskService.createTask({
      ...newTask,
      owner_id: user.id,
    });
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Delete(`:${ACCESS_OBJECT.BOARD}`)
  deleteTask(@Body() deleteData: TaskDeleteDto) {
    return this.taskService.deleteTask(deleteData.id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Delete(`clear/:${ACCESS_OBJECT.BOARD}`)
  deleteTaskByGroupID(@Body() deleteData: TaskDeleteDto) {
    return this.taskService.deleteTaskByGroupID(deleteData.id);
  }

  @RequiresPermission(ROLE.EDITOR, ACCESS_OBJECT.BOARD)
  @Patch(`reorder/:${ACCESS_OBJECT.BOARD}`)
  async updateTaskPositions(@Body() reorderData: TaskReorderDto) {
    return this.taskService.reorderTask(reorderData.positionList);
  }
}
