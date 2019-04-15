import { Injectable } from '@angular/core';
import { CustomFieldsObject } from '../models/custom-fields';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  public getDeployedState(object: CustomFieldsObject): boolean {
    // Check to ensure that object has custom fields with at least 1 element.
    if (object.custom_fields == null || object.custom_fields.length === 0) { return false; }

    // Try to find deployed key in the custom_fields array.
    const deployedState = object.custom_fields.find(c => c.key === 'deployed');

    // Check if deployed state custom_field exists.
    if (deployedState == null) { return false; }

    // Device42 stores these 'booleans' as yes/no strings, read them and convert to boolean.
    if (isNullOrUndefined(deployedState.value) || deployedState.value === 'no') { return false; } else
    if (deployedState.value === 'yes') { return true; }

    return false;
  }
}
