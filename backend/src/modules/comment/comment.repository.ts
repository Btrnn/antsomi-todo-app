// Libraries
import { Repository } from 'typeorm';

// Entities
import { CommentEntity } from './comment.entity';

export class CommentRepository extends Repository<CommentEntity> {
  async getList() {
    const entities = await this.find();
    return entities;
  }
}
