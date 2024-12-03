import { UserEntity } from '@app/modules/user/user.entity';
import { UserRepository } from '@app/modules/user/user.repository';
import { UserService } from '@app/modules/user/user.service';
import { forwardRef, Inject, Injectable, Scope } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@Injectable()
@ValidatorConstraint({ name: 'IsValidUsername', async: true })
export class IsValidUsernameConstraint implements ValidatorConstraintInterface {
  constructor(@Inject(forwardRef(() => UserService))  private readonly userService: UserService) {}
  async validate(
    username: string,
    args: ValidationArguments,
  ): Promise<boolean> {
    const existUser = await this.userService.findByUsername(username);
    if (existUser.data) return false;
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'This email or phone number have been used!';
  }
}

export function IsValidUsername(validationOptions?: ValidatorOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidUsernameConstraint,
    });
  };
}
