// Libraries
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Entities
import { GroupEntity } from '../group/group.entity';
import { TaskEntity } from '../task/task.entity';
import { BoardEntity } from './board.entity';

// Repository
import { BoardRepository } from './board.repository';

@Injectable()
export class BoardService {
  constructor(
    @InjectRepository(BoardEntity)
    private readonly boardRepository: BoardRepository,
    private readonly dataSource: DataSource,
  ) {}

  async findAll(userID: IdentifyId): Promise<ServiceResponse<BoardEntity[]>> {
    const entities = await this.boardRepository.find({
      where: {
        owner_id: userID as string,
      },
      order: {
        position: {
          direction: 'ASC',
        },
      },
    });
    return { data: entities, meta: { page: 1 } };
  }

  async createBoard(
    board: Omit<BoardEntity, 'id'>,
  ): Promise<ServiceResponse<BoardEntity>> {
    const entity = await this.boardRepository
      .createQueryBuilder()
      .insert()
      .into(BoardEntity)
      .values(board)
      .returning('*')
      .execute();
    return { data: entity.raw, meta: {} };
  }

  async deleteBoard(
    id: IdentifyId,
    userID: IdentifyId,
  ): Promise<ServiceResponse<BoardEntity>> {}
}
