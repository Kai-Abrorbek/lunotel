import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator';
import { PHONE_REGEX } from '../../utils/datetime.util';

@ValidatorConstraint({ async: false })
export class PhoneNumberConstraint implements ValidatorConstraintInterface {
	validate(value: string) {
		return typeof value === 'string' && PHONE_REGEX.test(value);
	}

	defaultMessage(args: ValidationArguments) {
		return `${args.property} must start with 010 or 8210 and contain digits only`;
	}
}

export const IsPhoneNumberKr = (validationOptions?: ValidationOptions) => {
	return (object: object, propertyName: string) => {
		registerDecorator({
			target: object.constructor,
			propertyName,
			options: validationOptions,
			constraints: [],
			validator: PhoneNumberConstraint,
		});
	};
};
