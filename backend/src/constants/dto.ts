// Libraries
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

// Validators
import { IsExistedUser, IsValidPermission } from '@app/validators';

export class PositionDto {
  @IsUUID()
  @IsNotEmpty()
  public readonly id: string;

  @IsNumber()
  @IsNotEmpty()
  public readonly position: number;
}

export class AccessDto {
  @IsUUID()
  @IsExistedUser()
  @IsNotEmpty()
  public readonly user_id: string;

  @IsValidPermission()
  @IsNotEmpty()
  permission: string;
}

export const NAME_CONSTRAINTS = {
  min: 1,
  max: 255,
  validationOptions: { message: 'Name must be between 1 and 255 characters' },
} as const;

export const USER_NAME_CONSTRAINTS = {
  min: 1,
  max: 30,
  validationOptions: {
    message: 'Your name must be between 1 and 30 characters',
  },
} as const;

export const DATE_CONSTRAINTS = {
  validationOptions: { message: 'Invalid Date' },
} as const;
