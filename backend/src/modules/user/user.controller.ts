// Libraries
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

// Services
import { UserService } from './user.service';

// Decorators
import { Public, User } from '@app/decorators';

// Constants
import { ROUTES } from '@app/constants';
import {
  UserCreateDto,
  UserDeleteDto,
  UserGetInfoDto,
  UserUpdateDto,
} from './dto';

// Types
import { UserRequest } from '@app/types';

@Controller(ROUTES.USER)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Get('info')
  getUserInfo(@User() user: UserRequest) {
    return this.userService.findOne(user.id);
  }

  @Get(':email')
  getInfoByEmail(@Param() findData: UserGetInfoDto) {
    return this.userService.findByEmail(findData.email);
  }

  @Public()
  @Post('create')
  createUser(@Body() newUser: UserCreateDto) {
    return this.userService.createUser(newUser);
  }

  @Delete(':id')
  deleteUser(@Param() deleteData: UserDeleteDto) {
    return this.userService.deleteUser(deleteData.id);
  }

  @Put('update')
  updateUser(@User() user: UserRequest, @Body() updateData: UserUpdateDto) {
    return this.userService.updateUser(user.id, updateData);
  }
}
