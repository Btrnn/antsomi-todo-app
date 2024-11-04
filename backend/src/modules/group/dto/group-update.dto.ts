import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { GroupCreateDto } from './group-create.dto';

export class GroupUpdateDto extends GroupCreateDto {
  @IsUUID()
  @IsNotEmpty()
  public readonly id: string;

  @IsString()
  @IsOptional()
  public readonly name: string;

  @IsNumber()
  @IsOptional()
  public readonly position: number;

  @IsString()
  @IsOptional()
  public readonly type: string;
}
