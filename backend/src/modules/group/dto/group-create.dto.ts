// Libraries
import { Type } from 'class-transformer';
import {
  IsDate,
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

// Constants
import { DATE_CONSTRAINTS, NAME_CONSTRAINTS } from '@app/constants/dto';

export class GroupCreateDto {
  @IsString()
  @IsNotEmpty()
  @Length(
    NAME_CONSTRAINTS.min,
    NAME_CONSTRAINTS.max,
    NAME_CONSTRAINTS.validationOptions,
  )
  public readonly name: string;

  @IsOptional()
  @IsDate(DATE_CONSTRAINTS.validationOptions)
  @Type(() => Date)
  public readonly created_at: Date;

  @IsNumber()
  @IsNotEmpty()
  public readonly position: number;

  @IsString()
  @IsNotEmpty()
  public readonly type: string;

  @IsOptional()
  @IsHexColor()
  public readonly color: string;
}
