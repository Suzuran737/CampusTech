import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import {
  isValidPostPlainText,
  POST_CONTENT_MAX_PLAIN_TEXT_LENGTH,
} from '../utils/post-content.util';

@ValidatorConstraint({ name: 'isValidPostContent', async: false })
export class IsValidPostContentConstraint
  implements ValidatorConstraintInterface
{
  validate(value: unknown) {
    if (typeof value !== 'string') {
      return false;
    }
    return isValidPostPlainText(value);
  }

  defaultMessage() {
    return `正文不能为空，且纯文本长度不能超过 ${POST_CONTENT_MAX_PLAIN_TEXT_LENGTH} 字`;
  }
}

export function IsValidPostContent(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsValidPostContentConstraint,
    });
  };
}
