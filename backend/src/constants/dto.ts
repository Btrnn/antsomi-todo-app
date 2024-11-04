// Libraries
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class PositionDto {
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @IsNumber()
  @IsNotEmpty()
  position: number;
}

export const NAME_CONSTRAINTS = {
  min: 1,
  max: 255,
  validationOptions: { message: 'Name must be between 1 and 255 characters' },
} as const;

export const DATE_CONSTRAINTS = {
  validationOptions: { message: 'Invalid Date' },
} as const;
