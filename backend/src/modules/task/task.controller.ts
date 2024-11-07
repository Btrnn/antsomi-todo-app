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
import { IdentifyId, UserRequest } from '@app/types';

// Entities
import { UserEntity } from '../user/user.entity';

// Decorators
import { User } from '@app/decorators';
import { RequiresPermission } from '@app/decorators/authorize.decorator';

// Constants
import {
  ACCESS_OBJECT,
  OBJECT_TYPE,
  PARAM_KEY,
  ROLE,
  ROUTES,
} from '@app/constants';

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

  @RequiresPermission(ROLE.VIEWER, OBJECT_TYPE.BOARD)
  @Get(`:${PARAM_KEY.OBJECT}`)
  getAllTasks(@Param(PARAM_KEY.OBJECT) boardID: IdentifyId) {
    return this.taskService.findAll(boardID);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Put(`:${PARAM_KEY.OBJECT}`)
  updateTask(@Body() task: TaskUpdateDto) {
    const { id, ...updateData } = task;
    return this.taskService.updateTask(id, updateData);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Post(`:${PARAM_KEY.OBJECT}`)
  createTask(@Body() newTask: TaskCreateDto, @User() user: UserRequest) {
    return this.taskService.createTask({
      ...newTask,
      owner_id: user.id,
    });
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Delete(`:${PARAM_KEY.OBJECT}`)
  deleteTask(@Body() deleteData: TaskDeleteDto) {
    return this.taskService.deleteTask(deleteData.id);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Delete(`clear/:${PARAM_KEY.OBJECT}`)
  deleteTaskByGroupID(@Body() deleteData: TaskDeleteDto) {
    return this.taskService.deleteTaskByGroupID(deleteData.id);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Patch(`reorder/:${PARAM_KEY.OBJECT}`)
  async updateTaskPositions(@Body() reorderData: TaskReorderDto) {
    return this.taskService.reorderTask(reorderData.positionList);
  }
}
