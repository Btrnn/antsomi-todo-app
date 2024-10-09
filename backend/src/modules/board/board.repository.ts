// Entities
import { Repository } from 'typeorm';
import { BoardEntity } from './board.entity';

export class BoardRepository extends Repository<BoardEntity> {}
