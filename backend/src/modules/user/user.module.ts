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

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  exports: [UserService],
  controllers: [UserController],
  providers: [TypeOrmModule, UserService, UserRepository],
})
export class UserModule {}
