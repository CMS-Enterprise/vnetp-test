import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-standard-form-modal',
  templateUrl: './standard-form-modal.component.html',
  styleUrls: ['./standard-form-modal.component.css'],
})
export class StandardFormModalComponent implements OnInit {
  public form: FormGroup;
  @Input() formInputs;
  public ngSelectOptions = {};

  constructor(private formBuilder: FormBuilder) {}
  ngOnInit(): void {
    console.log('formInputs', this.formInputs);
    this.testFun();
  }

  public setFields() {
    const setField = (prop: string, value: any, disable = false) => {
      const field = this.form.controls[prop];
      field.setValue(value);
      field.updateValueAndValidity();
      if (disable) {
        field.disable();
      }
    };
  }

  public testFun() {
    const group: FormGroup = this.formBuilder.group({});
    if (this.formInputs) {
      this.formInputs.forEach(input => {
        console.log('input', input);

        const initialValue = '';
        group.addControl(input.propertyName, this.formBuilder.control(initialValue));
        this.setFormControls(input);
      });
    }
  }

  public isEnum(object: any): boolean {
    if (object === null || object === undefined) {
      return false;
    }
    const values = Object.values(object);
    return values.every((value, index, array) => array.indexOf(value) === index);
  }

  public showPropertyList(property): boolean {
    if (property.propertyType === 'string' || property.propertyType === 'number') {
      return false;
    }

    if (this.isEnum(property.propertyType) || property.propertyType === 'boolean') {
      return true;
    }

    return false;
  }

  public getEnumValues(e: any) {
    if (e === null || e === undefined) {
      return [];
    }

    return Object.values(e);
  }

  private setFormControls(input): void {
    if (this.isEnum(input.propertyType)) {
      const enumValues = this.getEnumValues(input.propertyType);
      this.ngSelectOptions[input.propertyName] = enumValues;
    } else if (input.propertyType === 'boolean') {
      this.ngSelectOptions[input.propertyName] = ['true', 'false'];
    }
  }

  save() {}

  getData() {}

  reset() {}
}
