// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { BoardController } from './board.controller';

// Services
import { BoardService } from './board.service';
import { AccessService } from '../share_access/share_access.service';

// Repositories
import { AccessRepository } from '../share_access/share_access.repository';
import { BoardRepository } from './board.repository';

// Entities
import { BoardEntity } from './board.entity';
import { AccessEntity } from '../share_access/share_access.entity';

// Modules
import { BoardUserModule } from '../share_access/share_access.module';
import { AuthModule } from '../auth/auth.module';
import { GroupModule } from '../group/group.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([BoardEntity, AccessEntity]),
    BoardUserModule,
    AuthModule,
    GroupModule,
  ],
  controllers: [BoardController],
  providers: [
    TypeOrmModule,
    BoardService,
    BoardRepository,
    AccessService,
    AccessRepository,
  ],
})
export class BoardModule {}
