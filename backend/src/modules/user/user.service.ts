// Libraries
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Entities
import { UserEntity } from './user.entity';

// Repositories
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: UserRepository,
  ) {}

  async findAll(): Promise<
    ServiceResponse<Pick<UserEntity, 'id' | 'email' | 'name'>[]>
  > {
    const entities = await this.userRepository.find();
    if (!entities) {
      return {
        data: [],
        meta: {},
      };
    }
    const result = entities.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
    }));

    return {
      data: result,
      meta: { page: 1 },
    };
  }

  async findOne(
    id: IdentifyId,
  ): Promise<ServiceResponse<Omit<UserEntity, 'password'>>> {
    const entity = await this.userRepository.findOneBy({
      id: id as string,
    });

    // if (!entity) {
    //   throw new HttpException(
    //     {
    //       statusCode: HttpStatus.NOT_FOUND,
    //       statusMessage: 'Can not find this user',
    //     },
    //     HttpStatus.NOT_FOUND,
    //   );
    // }

    return {
      data: entity ? omit(entity, 'password') : null,
      meta: {},
    };
  }

  async findByEmail(
    email: string,
  ): Promise<ServiceResponse<Partial<UserEntity>>> {
    const entity = await this.userRepository.findOneBy({
      email,
    });

    return {
      data: entity ? omit(entity, 'password', 'created_at', 'role') : null,
      meta: {},
    };
  }

  async findByUsername(username: string): Promise<ServiceResponse<UserEntity>> {
    let entity = await this.userRepository.findOneBy({
      email: username,
    });
    if (!entity) {
      entity = await this.userRepository.findOneBy({
        phone_number: username,
      });
    }
    return {
      data: entity,
      meta: {},
    };
  }

  async createUser(
    user: Omit<UserEntity, 'id' | 'role' | 'created_at'>,
  ): Promise<ServiceResponse<UserEntity>> {
    const saltRounds = 10;

    const entity = await this.userRepository.save({
      ...user,
      password: await bcrypt.hash(user.password, saltRounds),
      role: 'user',
    });

    return {
      data: entity ? entity : null,
      meta: {},
    };
  }

  async deleteUser(id: IdentifyId): Promise<ServiceResponse<boolean>> {
    const result = await this.userRepository.delete(id);

    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async updateUser(
    id: IdentifyId,
    updateData: Partial<UserEntity>,
  ): Promise<ServiceResponse<boolean>> {
    const result = await this.userRepository.update(
      { id: id as string },
      updateData,
    );

    return {
      data: result.affected > 0,
      meta: {},
    };
  }
}
