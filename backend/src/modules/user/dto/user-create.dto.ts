// Libraries
import { DATE_CONSTRAINTS, USER_NAME_CONSTRAINTS } from '@app/constants/dto';
import { IsValidPassword, IsValidPhoneNumber } from '@app/validators';
import {
  IsValidUsername,
  IsValidUsernameConstraint,
} from '@app/validators/is-valid-username.validator';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Validate,
} from 'class-validator';

export class UserCreateDto {
  @IsNotEmpty()
  @Length(
    USER_NAME_CONSTRAINTS.min,
    USER_NAME_CONSTRAINTS.max,
    USER_NAME_CONSTRAINTS.validationOptions,
  )
  @IsString()
  public readonly name: string;

  @IsValidUsername()
  @IsOptional()
  @IsValidPhoneNumber()
  public readonly phone_number: string;

  @IsValidUsername()
  @IsEmail()
  @IsNotEmpty()
  public readonly email: string;

  @IsNotEmpty()
  @IsValidPassword()
  public readonly password: string;
}
