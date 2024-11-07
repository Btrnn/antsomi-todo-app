import { IsOptional } from 'class-validator';
import { BoardCreateDto } from './board-create.dto';

export class BoardUpdateDto extends BoardCreateDto {
  @IsOptional()
  public readonly name: string;

  @IsOptional()
  public readonly position: number;
}
