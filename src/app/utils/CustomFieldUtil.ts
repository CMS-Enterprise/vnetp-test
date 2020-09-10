import { CustomFieldsObject, CustomField } from '../models/interfaces/custom-fields-object.interface';

export default class CustomFieldUtil {
  /**
   * Device42 stores 'booleans' as yes/no strings, read them and convert to boolean.
   */
  static getBooleanCustomField(object: CustomFieldsObject, fieldName: string): boolean {
    if (!CustomFieldUtil.hasCustomField(object, fieldName)) {
      return false;
    }

    const { value } = CustomFieldUtil.getCustomField(object, fieldName);
    return value === 'Yes';
  }

  static getStringCustomField(object: CustomFieldsObject, fieldName: string): string {
    if (!CustomFieldUtil.hasCustomField(object, fieldName)) {
      return '';
    }

    const { value } = CustomFieldUtil.getCustomField(object, fieldName);
    if (value === null || value === undefined) {
      return '';
    }
    return value;
  }

  static getNumberCustomField(object: CustomFieldsObject, fieldName: string): number {
    if (!CustomFieldUtil.hasCustomField(object, fieldName)) {
      return -1;
    }

    const { value } = CustomFieldUtil.getCustomField(object, fieldName);
    const isValidNumber = (val: string): boolean => {
      if (val === null || val === undefined) {
        return false;
      }
      const num = +val;
      return num > Number.MIN_SAFE_INTEGER && num < Number.MAX_SAFE_INTEGER;
    };
    return isValidNumber(value) ? +value : -1;
  }

  static getJsonCustomField(object: CustomFieldsObject, fieldName: string): any {
    if (!CustomFieldUtil.hasCustomField(object, fieldName)) {
      return null;
    }

    const { value } = CustomFieldUtil.getCustomField(object, fieldName);
    if (value == null || value === undefined || value === '') {
      return null;
    }
    return JSON.parse(value);
  }

  static hasCustomField(object: CustomFieldsObject, fieldName: string): boolean {
    if (!object.custom_fields || object.custom_fields.length === 0) {
      return false;
    }
    return object.custom_fields.some(c => c.key === fieldName);
  }

  static getCustomField(object: CustomFieldsObject, fieldName: string): CustomField {
    return object.custom_fields.find(c => c.key === fieldName);
  }
}
