// Libraries
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsDate,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// Constants
import { DATE_CONSTRAINTS } from '@app/constants/dto';

export class CommentCreateDto {
  @IsString()
  @IsNotEmpty()
  public readonly content: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  public readonly parent_id: string | null;

  @IsOptional()
  @IsDate(DATE_CONSTRAINTS.validationOptions)
  @Type(() => Date)
  public readonly updated_at: Date | null;

  // @IsOptional()
  // public readonly attachments: string;

  //   @IsOptional()
  //   @IsObject()
  //   public readonly attachments: [
  //     {
  //       filename: string;
  //       path: string;
  //       url: string;
  //       size: number;
  //       mimetype: string;
  //     },
  //   ];
}
