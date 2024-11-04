import { IsNotEmpty, IsUUID } from 'class-validator';

export class TaskGetListDto {
  @IsUUID()
  @IsNotEmpty()
  public readonly boardID: string;
}
