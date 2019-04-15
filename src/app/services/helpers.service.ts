import { Injectable } from '@angular/core';
import { CustomFieldsObject } from '../models/custom-fields';
import { isNullOrUndefined } from 'util';

@Injectable({
  providedIn: 'root'
})
export class HelpersService {

  constructor() { }

  public getDeployedState(object: CustomFieldsObject): boolean {
    const deployedState = object.custom_fields.find(c => c.key === 'deployed').value;

    if (isNullOrUndefined(deployedState) || deployedState === 'no') { return false; } else
    if (deployedState === 'yes') { return true; }

    return false;
  }
}