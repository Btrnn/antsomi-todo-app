// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { AccessController } from './share_access.controller';

// Services
import { AccessService } from './share_access.service';

// Entities
import { AccessEntity } from './share_access.entity';

// Repositories
import { AccessRepository } from './share_access.repository';
import { BoardRepository } from '../board/board.repository';

@Module({
  exports: [AccessService],
  imports: [TypeOrmModule.forFeature([AccessEntity])],
  controllers: [AccessController],
  providers: [TypeOrmModule, AccessService, AccessRepository, BoardRepository],
})
export class ShareAccessModule {}
