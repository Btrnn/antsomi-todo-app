// Libraries
import { DATE_CONSTRAINTS, NAME_CONSTRAINTS } from '@app/constants/dto';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @Length(
    NAME_CONSTRAINTS.min,
    NAME_CONSTRAINTS.max,
    NAME_CONSTRAINTS.validationOptions,
  )
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  phone_number: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  password: string;

  @IsOptional()
  @IsDate()
  @Type(() => Date)
  public readonly created_at: Date;
  role: string;
}
