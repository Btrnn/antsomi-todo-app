import { OBJECT_TYPE, PARAM_KEY, ROLE, ROUTES } from '@app/constants';
import { Controller, Get, Query } from '@nestjs/common';
import { CommentService } from './comment.service';
import { RequiresPermission } from '@app/decorators/authorize.decorator';
import { IdentifyId } from '@app/types';

@Controller(ROUTES.COMMENT)
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @RequiresPermission(ROLE.VIEWER, OBJECT_TYPE.BOARD)
  @Get(`:${PARAM_KEY.OBJECT}`)
  getAllComments(@Query(PARAM_KEY.OBJECT) object_id: IdentifyId) {
    return this.commentService.getCommentList(object_id);
  }
}
