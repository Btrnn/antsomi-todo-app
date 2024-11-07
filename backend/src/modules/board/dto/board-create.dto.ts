import { NAME_CONSTRAINTS } from '@app/constants/dto';
import { IsNotEmpty, IsNumber, IsString, Length } from 'class-validator';

export class BoardCreateDto {
  @IsString()
  @Length(
    NAME_CONSTRAINTS.min,
    NAME_CONSTRAINTS.max,
    NAME_CONSTRAINTS.validationOptions,
  )
  @IsNotEmpty()
  public readonly name: string;

  @IsNumber()
  @IsNotEmpty()
  public readonly position: number;
}
