// Libraries
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { omit } from 'lodash';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

// Models
import { UserEntity } from './user.entity';

// Repositories
import { UserRepository } from './user.repository';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: UserRepository,
  ) {}
  async findAll(): Promise<ServiceResponse<UserEntity[]>> {
    const entities = await this.userRepository.find();
    return {
      data: entities,
      meta: { page: 1 },
    };
  }

  async findOne(
    id: IdentifyId,
  ): Promise<ServiceResponse<Omit<UserEntity, 'password'>>> {
    const entity = await this.userRepository.findOneBy({
      id: id as string,
    });
    return {
      data: {
        id: id as string,
        name: entity.name,
        phone_number: entity.phone_number,
        email: entity.email,
        created_at: entity.created_at,
        role: entity.role,
      },
      meta: {},
    };
  }

  async findInfoByEmail(
    email: string,
  ): Promise<ServiceResponse<Partial<UserEntity>>> {
    const entity = await this.userRepository.findOne({
      where: { email: email },
    });
    if (entity === null) {
      throw new HttpException(
        {
          statusCode: HttpStatus.NOT_FOUND,
          statusMessage: 'Can not find this user',
        },
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      data: omit(entity, 'password'),
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
    user: Omit<UserEntity, 'id' | 'role'>,
  ): Promise<ServiceResponse<UserEntity>> {
    const saltRounds = 10;

    const isExistedEmail = await this.findByUsername(user.email);
    const isExistedPhone = await this.findByUsername(user.phone_number);

    if (isExistedEmail.data || isExistedPhone.data) {
      throw new HttpException(
        {
          statusCode: HttpStatus.CONFLICT,
          statusMessage: 'Email or phone number have been used!',
        },
        HttpStatus.CONFLICT,
      );
    }

    const entity = this.userRepository.create({
      ...user,
      password: await bcrypt.hash(user.password, saltRounds),
      role: 'user',
    });
    await this.userRepository.save(entity);

    return {
      data: entity,
      meta: {},
    };
  }

  async deleteUser(id: IdentifyId): Promise<ServiceResponse<boolean>> {
    const result = await this.userRepository
      .createQueryBuilder()
      .delete()
      .from('User')
      .where('id = :id', { id })
      .execute();
    return {
      data: result.affected > 0,
      meta: {},
    };
  }

  async updateUser(
    id: IdentifyId,
    updateData: Partial<UserEntity>,
  ): Promise<ServiceResponse<UserEntity>> {
    const result = await this.userRepository
      .createQueryBuilder()
      .update(UserEntity)
      .set(updateData)
      .where('id = :id', { id })
      .returning('*')
      .execute();

    return {
      data: result.raw,
      meta: {},
    };
  }
}
