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

@Module({
  imports: [TypeOrmModule.forFeature([GroupEntity])],
  controllers: [GroupController],
  providers: [TypeOrmModule, GroupService, GroupRepository],
})
export class GroupModule {}
