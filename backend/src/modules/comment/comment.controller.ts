// Libraries
import { Controller, Get, Query } from '@nestjs/common';

// Constants
import { OBJECT_TYPE, PARAM_KEY, ROLE, ROUTES } from '@app/constants';

// Services
import { CommentService } from './comment.service';

// Decorators
import { RequiresPermission } from '@app/decorators';

// Types
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
