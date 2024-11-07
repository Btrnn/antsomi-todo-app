import { AccessDto } from '@app/constants';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

export class AccessCreateDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AccessDto)
  public readonly permissionList: AccessDto[];
}
