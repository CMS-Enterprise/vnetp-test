import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Contract } from 'src/app/models/firewall/contract';
import { FilterEntry } from 'src/app/models/firewall/filter-entry';
import { HelpersService } from 'src/app/services/helpers.service';
import { Filter } from 'ldapjs';

@Component({
  selector: 'app-contract-modal',
  templateUrl: './contract-modal.component.html',
  styleUrls: ['./contract-modal.component.css']
})
export class ContractModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  filterEntries: Array<FilterEntry>;
  newFilterEntry: FilterEntry;

  constructor(private ngx: NgxSmartModalService, private formBuilder: FormBuilder, private hs: HelpersService) {
  }

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const contract = new Contract();
    contract.Name = this.form.value.name;
    contract.Description = this.form.value.description;

    contract.FilterEntries = this.filterEntries;

    this.ngx.resetModalData('contractModal');
    this.ngx.setModalData(Object.assign({}, contract), 'contractModal');
    this.ngx.close('contractModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('contractModal');
    this.reset();
  }

  get f() { return this.form.controls; }

  private setFormValidators() {
  }

  getData() {
    const contract =  Object.assign({}, this.ngx.getModalData('contractModal') as Contract);

    if (contract !== undefined) {
      this.form.controls.name.setValue(contract.Name);
    }

    if (contract.FilterEntries) {
      this.filterEntries = contract.FilterEntries;
    } else {
      this.filterEntries = new Array<FilterEntry>();
    }

    this.ngx.resetModalData('contractModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
    });
    this.newFilterEntry = new FilterEntry();
  }

  addFilterEntry() {
    this.filterEntries.push(this.hs.deepCopy(this.newFilterEntry));
    this.newFilterEntry = new FilterEntry();
  }

  removeFilterEntry(filterEntry: FilterEntry) {
    const index = this.filterEntries.indexOf(filterEntry);

    if (index > -1) {
      this.filterEntries.splice(index, 1);
    }
  }

  private unsubAll() {
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
