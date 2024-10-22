// Libraries
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Request,
} from '@nestjs/common';

// Services
import { AuthService } from './auth.service';

// Types
import { ServiceResponse } from '@app/types';

// Entities
import { UserEntity } from '@app/modules/user/user.entity';

// Decorators
import { Public } from '@app/decorators';

// Constants
import { ROUTES } from '@app/constants';

@Controller(ROUTES.AUTH)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('login')
  signIn(@Body() signInDto: Record<string, any>) {
    return this.authService.signIn(signInDto.username, signInDto.password);
  }

  @Get('profile')
  getProfile(@Request() req): ServiceResponse<UserEntity> {
    return { data: req.user, meta: {} };
  }

  @Post('check-token')
  checkToken() {
    return { data: true, meta: {} };
  }
}
