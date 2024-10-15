// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { TaskController } from './task.controller';

// Services
import { TaskService } from './task.service';

// Entities
import { TaskEntity } from './task.entity';

// Repositories
import { TaskRepository } from './task.repository';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([TaskEntity]), AuthModule],
  controllers: [TaskController],
  providers: [TypeOrmModule, TaskService, TaskRepository],
})
export class TaskModule {}
