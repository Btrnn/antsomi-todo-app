import { Injectable } from '@nestjs/common';
import { TaskService } from '../task/task.service';
import { IdentifyId, ServiceResponse } from '@app/types';
import { promises } from 'fs';

@Injectable()
export class FileService {
  constructor(private readonly taskService: TaskService) {}
  async uploadFile(
    file: Express.Multer.File,
    id: IdentifyId,
    type: string,
  ): Promise<
    ServiceResponse<{
      filename: string;
      path: string;
      size: number;
      mimetype: string;
    }>
  > {
    const result = await this.taskService.addAttachments(id, {
      filename: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
    });
    return { data: result.data, meta: {} };
  }

  async deleteFile(
    id: IdentifyId,
    filePath: string,
  ): Promise<ServiceResponse<boolean>> {
    const fullPath = `./${filePath}`;
    await promises.unlink(fullPath);
    const result = await this.taskService.deleteAttachments(id, filePath);
    return { data: result.data, meta: {} };
  }
}
