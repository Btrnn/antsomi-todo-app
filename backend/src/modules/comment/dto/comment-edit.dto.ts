import { IsNotEmpty, IsUUID } from 'class-validator';
import { CommentCreateDto } from './comment-create.dto';

export class CommentEditDto extends CommentCreateDto {
  @IsNotEmpty()
  @IsUUID()
  public readonly id: string;

  @IsNotEmpty()
  public readonly updated_at: Date | null;
}
