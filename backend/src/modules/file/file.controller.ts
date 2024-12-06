// Libraries
import {
  Body,
  Controller,
  Delete,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

// Constants
import { OBJECT_TYPE, PARAM_KEY, ROLE, ROUTES } from '@app/constants';

// Services
import { FileService } from './file.service';

// Types
import { IdentifyId } from '@app/types';

// Decorators
import { RequiresPermission } from '@app/decorators';

@Controller(ROUTES.FILE)
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Post(`upload/:${PARAM_KEY.OBJECT}`)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadData: { id: IdentifyId; type: string },
  ) {
    return this.fileService.uploadFile(file, uploadData.id, uploadData.type);
  }

  @RequiresPermission(ROLE.EDITOR, OBJECT_TYPE.BOARD)
  @Delete(`:${PARAM_KEY.OBJECT}`)
  @UseInterceptors(FileInterceptor('file'))
  deleteFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() deleteData: { id: IdentifyId; path: string },
  ) {
    return this.fileService.deleteFile(deleteData.id, deleteData.path);
  }

  //   @Get(':filename')
  //   async getFile(@Param('filename') filename: string, @Res() res: Response) {
  //     const filePath = join(process.cwd(), 'uploads', filename);
  //     return res.sendFile(filePath);
  //   }
}
