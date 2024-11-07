import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserGetInfoDto {
  @IsEmail()
  @IsNotEmpty()
  public readonly email: string;
}
