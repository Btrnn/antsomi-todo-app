// Libraries
import { Repository } from 'typeorm';
import { Injectable } from '@nestjs/common';

// Entities
import { UserEntity } from './user.entity';

@Injectable()
export class UserRepository extends Repository<UserEntity> {
  async getList() {
    const entities = await this.find();

    return entities;
  }
}
