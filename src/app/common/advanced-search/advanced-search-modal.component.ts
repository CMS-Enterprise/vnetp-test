import { Component, OnInit, Input } from '@angular/core';
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
  form: FormGroup;
  submitted: boolean;
  modalBody;
  modalTitle;

  rulesHit = [];
  partialMatches = [];
  showPartials = false;
  doneSearching = false;
  protocolSubscription: Subscription;
  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    console.log('inited!!');
  }

  public reset() {
    console.log('reset');
  }

  public test() {
    console.log('test?');
    console.log(this.formInputs);
    const input = document.getElementsByClassName('form-control');
    console.log('input', input);
    this.formInputs.map(input => {
      const formControl = new FormControl(input.displayName);
      this.form.addControl(input.displayName, formControl);
      this.form.controls[input.displayName].setValue('');
    });
    console.log('form', this.form);
  }

  public searchThis(event?) {
    const inputs = document.getElementsByClassName('form-control');
    console.log('inputs', inputs);
    const elements: any = Array.from(inputs);
    console.log('elements', elements);
    const valueArray = [];
    elements.map(e => {
      const value = e.value;
      console.log('value', value);
      valueArray.push(value);
    });
    console.log('valueArray', valueArray);
    this.formInputs.map(input => {
      // const formControl = new FormControl(input.displayName);
      // this.form.addControl(input.displayName, formControl)
      this.form.controls[input.displayName].updateValueAndValidity();
    });
    console.log('form', this.form);
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({});
  }
}
