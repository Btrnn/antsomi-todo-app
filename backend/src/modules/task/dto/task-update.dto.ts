import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { TaskCreateDto } from './task-create.dto';

export class TaskUpdateDto extends TaskCreateDto {
  @IsUUID()
  @IsNotEmpty()
  public readonly id: string;

  @IsOptional()
  @IsString()
  @Length(1, 255, { message: 'Name must be between 1 and 255 characters' })
  public readonly name: string;

  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  public readonly status_id: string;

  @IsOptional()
  @IsNumber()
  @IsNotEmpty()
  public readonly position: number;
}
