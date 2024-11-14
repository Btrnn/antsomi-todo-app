import { Module } from '@nestjs/common';
import { FileController } from './file.controller';
import { FileService } from './file.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { TaskService } from '../task/task.service';
import { TaskRepository } from '../task/task.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TaskEntity } from '../task/task.entity';

// @Module({
//   controllers: [FileController],
//   providers: [FileService]
// })
// export class FileModule {}

@Module({
  imports: [
    TypeOrmModule.forFeature([TaskEntity]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const filename = `${Date.now()}-${file.originalname}`;
          cb(null, filename);
        },
      }),
    }),
  ],
  controllers: [FileController],
  providers: [FileService, TaskService],
})
export class FileModule {}
