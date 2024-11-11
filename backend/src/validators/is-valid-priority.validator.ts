import { PriorityType, PRIORITY } from '@app/constants';
import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPriority', async: false })
export class IsValidPriorityConstraint implements ValidatorConstraintInterface {
  validate(priority: string, args: ValidationArguments) {
    return (
      (typeof priority === 'string' &&
        Object.values(PRIORITY).includes(priority as PriorityType)) ||
      null
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'Invalid priority';
  }
}

export function IsValidPriority(validationOptions?: ValidatorOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPriorityConstraint,
    });
  };
}
