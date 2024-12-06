import { UserEntity } from '@app/modules/user/user.entity';
import { UserRepository } from '@app/modules/user/user.repository';
import { UserService } from '@app/modules/user/user.service';
import { IdentifyId } from '@app/types';
import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  isUUID,
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'IsExistedUser', async: true })
export class IsExistedUserConstraint implements ValidatorConstraintInterface {
  constructor(
    @Inject(forwardRef(() => UserService))
    private readonly userService: UserService,
  ) {}
  async validate(id: IdentifyId, args: ValidationArguments): Promise<boolean> {
    if (!isUUID(id)) return false;
    const existUser = await this.userService.findOne(id);
    if (existUser.data) return true;
    return false;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This user does not exist!';
  }
}

export function IsExistedUser(validationOptions?: ValidatorOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsExistedUserConstraint,
    });
  };
}
