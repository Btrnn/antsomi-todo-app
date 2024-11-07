import { IsExistedUser } from '@app/validators';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class ChangeOwnerDto {
  @IsExistedUser()
  @IsUUID()
  @IsNotEmpty()
  public readonly new_owner: string;
}
