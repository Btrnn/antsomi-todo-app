// Libraries
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

// Constants
import { PositionDto } from '@app/constants/dto';

export class GroupReorderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  public readonly positionList: PositionDto[];
}
