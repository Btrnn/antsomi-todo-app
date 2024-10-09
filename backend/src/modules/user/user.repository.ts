// Libraries
import { Repository } from 'typeorm';

// Entities
import { UserEntity } from './user.entity';

export class UserRepository extends Repository<UserEntity> {
  async getList() {
    const entities = await this.find();

    return entities;
  }
}
