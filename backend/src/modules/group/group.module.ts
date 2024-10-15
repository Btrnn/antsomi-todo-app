// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { GroupController } from './group.controller';

// Services
import { GroupService } from './group.service';

// Repositories
import { GroupRepository } from './group.repository';

// Entities
import { GroupEntity } from './group.entity';

// Modules
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity]), AuthModule],
  controllers: [GroupController],
  providers: [TypeOrmModule, GroupService, GroupRepository],
  exports: [GroupService],
})
export class GroupModule {}
