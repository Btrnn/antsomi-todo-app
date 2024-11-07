// Libraries
import { IsOptional } from 'class-validator';

// DTOs
import { UserCreateDto } from './user-create.dto';
import { IsValidPassword } from '@app/validators';

export class UserUpdateDto extends UserCreateDto {
  @IsOptional()
  public readonly name: string;

  @IsOptional()
  public readonly email: string;

  @IsOptional()
  @IsValidPassword()
  public readonly password: string;
}
