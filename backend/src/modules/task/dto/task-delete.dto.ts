import { IsNotEmpty, IsUUID } from 'class-validator';

export class TaskDeleteDto {
  @IsUUID()
  @IsNotEmpty()
  public readonly id: string;
}
