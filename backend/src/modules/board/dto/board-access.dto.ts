import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';

// Constants
import { AccessDto } from '@app/constants';

export class ShareAccessDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessDto)
  public readonly permissionList: AccessDto[];
}

export class UpdateAccessDto extends ShareAccessDto {}

export class DeleteAccessDto {
  @IsUUID()
  @IsNotEmpty()
  public readonly user_id: string;
}

export class ChangeOwnerDto {
@IsUUID()
  @IsNotEmpty()
  public readonly new_owner: string;
}
