// Libraries
import {
  IsUUID,
  IsNotEmpty,
  IsString,
  IsDate,
  Length,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

// Constants
import { DATE_CONSTRAINTS, NAME_CONSTRAINTS } from '@app/constants/dto';
import { IsExistedUser, IsValidPriority } from '@app/validators';

export class TaskCreateDto {
  @IsString()
  @IsNotEmpty()
  @Length(
    NAME_CONSTRAINTS.min,
    NAME_CONSTRAINTS.max,
    NAME_CONSTRAINTS.validationOptions,
  )
  public readonly name: string;

  @IsOptional()
  @IsString()
  public readonly description: string;

  @IsOptional()
  @IsDate(DATE_CONSTRAINTS.validationOptions)
  @Type(() => Date)
  public readonly created_at: Date;

  @IsOptional()
  @IsDate(DATE_CONSTRAINTS.validationOptions)
  @Type(() => Date)
  public readonly start_date: Date | null;

  @IsOptional()
  @IsDate(DATE_CONSTRAINTS.validationOptions)
  @Type(() => Date)
  public readonly end_date: Date | null;

  @IsUUID()
  @IsNotEmpty()
  public readonly status_id: string;

  @IsNumber()
  @IsNotEmpty()
  public readonly position: number;

  @IsOptional()
  @IsUUID()
  @IsExistedUser()
  public readonly assignee_id: string;

  @IsOptional()
  @IsUUID()
  @IsExistedUser()
  public readonly reviewer_id: string;

  @IsOptional()
  @IsNumber()
  public readonly est_time: number;

  @IsOptional()
  @IsValidPriority()
  public readonly priority: string;
}
