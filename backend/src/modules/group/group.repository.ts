// Entities
import { Repository } from 'typeorm';
import { GroupEntity } from './group.entity';

export class GroupRepository extends Repository<GroupEntity> {
  async findByName(): Promise<GroupEntity[]> {
    const groups = await this.find();
    return groups;
  }

  async createGroup(
    name: string,
    position: number,
    type: string,
    color: string,
  ): Promise<GroupEntity> {
    const group = this.create({ name, position, type, color });
    return group;
  }

  async getList() {
    const entities = await this.find();

    return entities;
  }
}
