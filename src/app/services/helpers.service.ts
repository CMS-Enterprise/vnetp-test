import { Injectable } from '@angular/core';
import { CustomFieldsObject, CustomField } from '../models/custom-fields-object-interface';
import { isNullOrUndefined, isNull } from 'util';
import { elementStart } from '@angular/core/src/render3';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  private getCustomField(object: CustomFieldsObject, fieldName: string): [boolean, CustomField] {
    // Check to ensure that object has custom fields with at least 1 element.
    if (object.custom_fields == null || object.custom_fields.length === 0) { return [false, null]; }

    // Try to find deployed key in the custom_fields array.
    const customField = object.custom_fields.find(c => c.key === fieldName) as CustomField;

        // Check if custom_field exists.
    if (customField == null) { return [false, null ]; } else {
      return [true, customField];
    }
  }

  public getBooleanCustomField(object: CustomFieldsObject, fieldName: string): boolean {
    const result = this.getCustomField(object, fieldName);
    if (result[0] === false) { return false; }

    const customField = result[1];
    // Device42 stores 'booleans' as yes/no strings, read them and convert to boolean.
    if (isNullOrUndefined(customField.value) || customField.value !== 'yes') { return false; } else
    if (customField.value === 'yes') { return true; }

    return false;
  }

  public getStringCustomField(object: CustomFieldsObject, fieldName: string): string {
    const result = this.getCustomField(object, fieldName);
    if (result[0] === false) { return '';}

    const customField = result[1];
    if (isNullOrUndefined(customField.value)) { return ''; } else {
      return customField.value;
    }
  }

  public getNumberCustomField(object: CustomFieldsObject, fieldName: string): number {
    const result = this.getCustomField(object, fieldName);
    if (result[0] === false) { return -1; }

    const customField = result[1];
    // Ensure that the number is valid.
    if (isNullOrUndefined(customField.value) ||
    Number(customField.value) < Number.MIN_SAFE_INTEGER ||
    Number(customField.value) > Number.MAX_SAFE_INTEGER) { return -1; } else {
      return +customField.value;
    }
  }
}
