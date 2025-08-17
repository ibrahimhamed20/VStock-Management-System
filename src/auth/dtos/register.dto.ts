import { IsString, IsEmail, IsNotEmpty, Length, IsEnum, IsArray, ArrayNotEmpty } from 'class-validator';
import { UserRole } from '../interfaces/auth-payload.interface';
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

const ALLOWED_REGISTRATION_ROLES = [UserRole.CASHIER, UserRole.ACCOUNTANT];

export function IsAllowedRegistrationRole(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isAllowedRegistrationRole',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return ALLOWED_REGISTRATION_ROLES.includes(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Role must be cashier or accountant';
        },
      },
    });
  };
}

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  username: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Length(6, 100)
  password: string;

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  roles: string[];
}
