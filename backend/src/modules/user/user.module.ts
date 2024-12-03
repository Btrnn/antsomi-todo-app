// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { UserEntity } from './user.entity';

// Controllers
import { UserController } from './user.controller';

// Services
import { UserService } from './user.service';

// Repositories
import { UserRepository } from './user.repository';

// Validators
import {
  IsExistedUserConstraint,
  IsValidUsernameConstraint,
} from '@app/validators';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  exports: [UserService],
  controllers: [UserController],
  providers: [
    UserService,
    UserRepository,
    IsValidUsernameConstraint,
    IsExistedUserConstraint,
  ],
})
export class UserModule {}
