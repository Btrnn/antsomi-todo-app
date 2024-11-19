import { Module } from '@nestjs/common';
import { CommentEntity } from './comment.entity';
import { CommentController } from './comment.controller';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentService } from './comment.service';
import { CommentRepository } from './comment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity]), AuthModule],
  controllers: [CommentController],
  providers: [TypeOrmModule, CommentService, CommentRepository],
})
export class CommentModule {}
