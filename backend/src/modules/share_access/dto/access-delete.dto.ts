import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteAccessDto {
  @IsUUID()
  @IsNotEmpty()
  public readonly user_id: string;
}
