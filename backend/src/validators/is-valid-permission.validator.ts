import { ROLE } from '@app/constants';
import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

type RoleType = (typeof ROLE)[keyof typeof ROLE];

@ValidatorConstraint({ name: 'IsValidPermission', async: false })
export class IsValidPermissionConstraint
  implements ValidatorConstraintInterface
{
  validate(permission: string, args: ValidationArguments) {
    return (
      typeof permission === 'string' &&
      Object.values(ROLE).includes(permission as RoleType)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid permission';
  }
}

export function IsValidPermission(validationOptions?: ValidatorOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPermissionConstraint,
    });
  };
}
