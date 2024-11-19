// Libraries
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

// Entities
import { CommentEntity } from './comment.entity';

// Repositories
import { CommentRepository } from './comment.repository';

// Types
import { ServiceResponse } from '@app/types';

@Injectable()
export class CommentService {
  constructor() {} //private readonly dataSource: DataSource, //private readonly commentRepository: CommentRepository, //@InjectRepository(CommentEntity)

  //   async createComment(
  //     comment: Omit<CommentEntity, 'id' | 'created_at'>,
  //   ): Promise<ServiceResponse<CommentEntity>> {
  //     const entity = await this.commentRepository.save(comment);

  //     return {
  //       data: entity ? entity : null,
  //       meta: {},
  //     };
  //   }
}
