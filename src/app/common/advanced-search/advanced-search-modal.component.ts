import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { V1NetworkSecurityNetworkObjectsService, V1NetworkSecurityNetworkObjectGroupsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-advanced-search-modal',
  templateUrl: './advanced-search-modal.component.html',
})
export class AdvancedSearchComponent implements OnInit {
  @Input() formInputs;
  @Output() searchCriteria = new EventEmitter<any>();
  form: FormGroup;
  submitted: boolean;
  modalBody;
  modalTitle;

  doneSearching = false;
  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public reset() {
    this.ngx.resetModalData('advancedSearch');
    const inputs = document.getElementsByClassName('form-control');
    const elements: any = Array.from(inputs);
    elements.map(element => {
      element.value = '';
    });
    this.ngx.close('advancedSearch');
  }

  public test() {
    this.formInputs.map(input => {
      const formControl = new FormControl(input.displayName);
      this.form.addControl(input.displayName, formControl);
      this.form.controls[input.displayName].setValue('');
    });
  }

  public searchThis() {
    const inputs = document.getElementsByClassName('form-control');
    const elements: any = Array.from(inputs);
    const valueArray = [];
    elements.map(e => {
      const value = e.value;
      valueArray.push(value);
    });
    let i = 0;
    // tslint:disable-next-line
    for (const field in this.form.controls) {
      // 'field' is a string
      const control = this.form.get(field); // 'control' is a FormControl
      const value = valueArray[i];
      control.setValue(value);
      i = i + 1;
    }

    /// LOOK AT CONSOLIDATING LOGIC FOR BUILDING QUERY STRING INTO THIS COMPONENT
    ///

    this.searchCriteria.emit(this.form.value);
    this.reset();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({});
  }
}
