import {
  registerDecorator,
  type ValidationOptions,
} from 'class-validator';
import { isValidAddress } from './address';

export function IsValidAddress(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string): void {
    registerDecorator({
      name: 'isValidAddress',
      target: object.constructor,
      propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown): boolean {
          return typeof value === 'string' && isValidAddress(value);
        },
        defaultMessage(): string {
          return 'address must be a valid .zz address';
        },
      },
    });
  };
}
