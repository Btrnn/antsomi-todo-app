// Libraries
import { IsUUID, IsNotEmpty } from 'class-validator';

export class CommentDeleteDto {
  @IsNotEmpty()
  @IsUUID()
  public readonly id: string;

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
