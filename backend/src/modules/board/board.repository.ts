// Libraries
import { Repository } from 'typeorm';

// Entities
import { BoardEntity } from './board.entity';

export class BoardRepository extends Repository<BoardEntity> {}
