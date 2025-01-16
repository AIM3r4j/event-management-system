import { registerDecorator, ValidationArguments, ValidationOptions } from 'class-validator';

export function IsExclusive(property: string, validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isExclusive',
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints: [property],
            validator: {
                validate(value: any, args: ValidationArguments) {
                    console.log(value)
                    const [relatedPropertyName] = args.constraints;
                    const relatedValue = (args.object as any)[relatedPropertyName];
                    return (
                        (value && !relatedValue) || // current property is defined, related is not
                        (!value && relatedValue)    // current property is not defined, related is
                    );
                },
                defaultMessage(args: ValidationArguments) {
                    const [relatedPropertyName] = args.constraints;
                    return `${args.property} and ${relatedPropertyName} cannot both be present or absent simultaneously.`;
                },
            },
        });
    };
}
