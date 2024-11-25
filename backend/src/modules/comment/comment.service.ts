// Libraries
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { toZonedTime } from 'date-fns-tz';

// Entities
import { CommentEntity } from './comment.entity';

// Repositories
import { CommentRepository } from './comment.repository';

// Types
import { IdentifyId, ServiceResponse } from '@app/types';

@Injectable()
export class CommentService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CommentEntity)
    private readonly commentRepository: CommentRepository,
  ) {}

  async getCommentList(
    object_id: IdentifyId,
  ): Promise<ServiceResponse<CommentEntity[]>> {
    const entities = await this.commentRepository.find({
      where: {
        object_id: object_id as string,
      },
      order: {
        created_at: {
          direction: 'ASC',
        },
      },
    });

    // const timeZone = 'Asia/Ho_Chi_Minh';
    // entities.forEach((comment) => {
    //   if (comment.created_at) {
    //     console.log(
    //       '🚀 ~ CommentService ~ entities.forEach ~ comment.created_at before:',
    //       comment.created_at,
    //     );
    //     comment.created_at = toZonedTime(comment.created_at, timeZone);
    //     console.log(
    //       '🚀 ~ CommentService ~ entities.forEach ~ comment.created_at after:',
    //       comment.created_at,
    //     );
    //   }
    // });

    return { data: entities, meta: {} };
  }

  async createComment(
    comment: Omit<CommentEntity, 'id' | 'created_at'>,
  ): Promise<ServiceResponse<CommentEntity>> {
    const entity = await this.commentRepository.save(comment);

    return {
      data: entity,
      meta: {},
    };
  }

  async deleteComment(
    commentID: IdentifyId,
  ): Promise<ServiceResponse<boolean>> {
    await this.commentRepository.delete({
      parent_id: commentID as string,
    });

    const entity = await this.commentRepository.delete({
      id: commentID as string,
    });

    return {
      data: entity.affected > 0,
      meta: {},
    };
  }

  async updateComment(
    comment: Pick<CommentEntity, 'id' | 'content' | 'updated_at'>,
  ): Promise<ServiceResponse<boolean>> {
    const entity = await this.commentRepository.update(
      { id: comment.id },
      { content: comment.content, updated_at: comment.updated_at },
    );

    return {
      data: entity.affected > 0,
      meta: {},
    };
  }
}
