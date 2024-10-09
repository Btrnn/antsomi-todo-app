// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { BoardController } from './board.controller';

// Services
import { BoardService } from './board.service';

// Repositories
import { BoardRepository } from './board.repository';

// Entities
import { BoardEntity } from './board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BoardEntity])],
  controllers: [BoardController],
  providers: [TypeOrmModule, BoardService, BoardRepository],
})
export class BoardModule {}
