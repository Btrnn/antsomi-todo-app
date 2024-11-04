import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class GroupDeleteDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  public readonly id: string;
}
