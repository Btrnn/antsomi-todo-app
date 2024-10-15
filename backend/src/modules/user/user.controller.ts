// Libraries
import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

// Services
import { UserService } from './user.service';

// Entities
import { UserEntity } from './user.entity';

// Types
import { IdentifyId } from '@app/types';

// Decorators
import { Public, User } from '@app/decorators';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers() {
    return this.userService.findAll();
  }

  @Get('info')
  getUserInfo(@User() user: UserEntity) {
    return this.userService.findOne(user.id);
  }

  @Get(':email')
  getInfoByEmail(@Param('email') email: string) {
    return this.userService.findInfoByEmail(email);
  }

  @Public()
  @Post('create')
  createUser(@Body() newUser: Omit<UserEntity, 'id'>) {
    return this.userService.createUser(newUser);
  }

  @Delete(':id')
  deleteTask(@Param('id') id: IdentifyId) {
    return this.userService.deleteUser(id);
  }
}
