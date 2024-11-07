import {
  registerDecorator,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidatorOptions,
} from 'class-validator';

@ValidatorConstraint({ name: 'IsValidPassword', async: false })
export class IsValidPasswordConstraint implements ValidatorConstraintInterface {
  validate(password: string, args: ValidationArguments) {
    return (
      typeof password === 'string' &&
      password.length >= 5 &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password)
    );
  }

  defaultMessage(args: ValidationArguments) {
    return 'Password must be at least 5 characters long and include at least one lowercase letter and one number';
  }
}

export function IsValidPassword(validationOptions?: ValidatorOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPasswordConstraint,
    });
  };
}
