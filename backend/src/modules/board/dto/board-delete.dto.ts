import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class BoardDeleteDto {
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  public readonly id: string;
}
