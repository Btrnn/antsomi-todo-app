import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPhoneNumber', async: false })
export class IsValidPhoneNumberConstraint
  implements ValidatorConstraintInterface
{
  validate(phone_number: string, args: ValidationArguments) {
    return (
      typeof phone_number === 'string' &&
      phone_number.length === 10 &&
      /^\d+$/.test(phone_number)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'Phone number must be a 10-digit string containing only numeric characters';
  }
}

export function IsValidPhoneNumber(validationOptions?: ValidatorOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPhoneNumberConstraint,
    });
  };
}
