// Libraries
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { CommentEntity } from './comment.entity';

// Controllers
import { CommentController } from './comment.controller';

// Modules
import { AuthModule } from '../auth/auth.module';

// Services
import { CommentService } from './comment.service';

// Repositories
import { CommentRepository } from './comment.repository';

// Gateways
import { CommentGateway } from './comment.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([CommentEntity]), AuthModule],
  controllers: [CommentController],
  providers: [TypeOrmModule, CommentService, CommentRepository, CommentGateway],
})
export class CommentModule {}
