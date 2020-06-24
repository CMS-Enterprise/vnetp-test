import { Injectable } from '@angular/core';
import { CustomFieldsObject, CustomField } from '../models/interfaces/custom-fields-object.interface';

@Injectable({
  providedIn: 'root',
})
export class HelpersService {
  private getCustomField(object: CustomFieldsObject, fieldName: string): [boolean, CustomField] {
    // Check to ensure that object has custom fields with at least 1 element.
    if (object.custom_fields == null || object.custom_fields.length === 0) {
      return [false, null];
    }

    // Try to find deployed key in the custom_fields array.
    const customField = object.custom_fields.find(c => c.key === fieldName) as CustomField;

    // Check if custom_field exists.
    if (customField == null) {
      return [false, null];
    }
    return [true, customField];
  }

  public getBooleanCustomField(object: CustomFieldsObject, fieldName: string): boolean {
    const [hasCustomField, customField] = this.getCustomField(object, fieldName);

    if (!hasCustomField) {
      return false;
    }
    // Device42 stores 'booleans' as yes/no strings, read them and convert to boolean.
    return customField.value === 'Yes';
  }

  public getStringCustomField(object: CustomFieldsObject, fieldName: string): string {
    const [hasCustomField, customField] = this.getCustomField(object, fieldName);
    if (!hasCustomField) {
      return '';
    }

    if (customField.value == null || customField.value === undefined) {
      return '';
    }
    return customField.value;
  }

  public getNumberCustomField(object: CustomFieldsObject, fieldName: string): number {
    const [hasCustomField, customField] = this.getCustomField(object, fieldName);
    if (!hasCustomField) {
      return -1;
    }

    // Ensure that the number is valid.
    if (
      customField.value == null ||
      customField.value === undefined ||
      Number(customField.value) < Number.MIN_SAFE_INTEGER ||
      Number(customField.value) > Number.MAX_SAFE_INTEGER
    ) {
      return -1;
    }
    return +customField.value;
  }

  public getJsonCustomField(object: CustomFieldsObject, fieldName: string): any {
    const [hasCustomField, customField] = this.getCustomField(object, fieldName);
    if (!hasCustomField) {
      return null;
    }

    if (customField.value == null || customField.value === undefined || customField.value === '') {
      return null;
    }
    return JSON.parse(customField.value);
  }

  public deepCopy<T>(obj: T): T {
    if (!obj) {
      throw new Error('Null Object.');
    }
    return JSON.parse(JSON.stringify(obj));
  }
}
