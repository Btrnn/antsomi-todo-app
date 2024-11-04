// Libraries
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';

// Constants
import { PositionDto } from '@app/constants/dto';

export class TaskReorderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PositionDto)
  public readonly positionList: PositionDto[];
}
