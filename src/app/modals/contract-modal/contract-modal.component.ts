import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Contract } from 'src/app/models/firewall/contract';
import { FilterEntry } from 'src/app/models/firewall/filter-entry';
import { ValidatePortRange } from 'src/app/validators/network-form-validators';
import { ContractModalHelpText } from 'src/app/helptext/help-text-networking';

@Component({
  selector: 'app-contract-modal',
  templateUrl: './contract-modal.component.html'
})
export class ContractModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  filterEntryForm: FormGroup;
  submitted: boolean;
  filterEntryFormSubmitted: boolean;
  filterEntries: Array<FilterEntry>;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: ContractModalHelpText
  ) {}

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

  get f() {
    return this.form.controls;
  }

  get fe() {
    return this.filterEntryForm.controls;
  }

  private setFormValidators() {}

  getData() {
    const contract = Object.assign({}, this.ngx.getModalData(
      'contractModal'
    ) as Contract);

    if (contract !== undefined) {
      this.form.controls.name.setValue(contract.Name);
      this.form.controls.description.setValue(contract.Description);
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
      description: ['']
    });

  }

  private buildFilterEntryForm() {
    this.filterEntryForm = this.formBuilder.group({
      name: ['', Validators.required],
      protocol: ['', Validators.required],
      sourcePorts: [
        '',
        Validators.compose([Validators.required, ValidatePortRange])
      ],
      destinationPorts: [
        '',
        Validators.compose([Validators.required, ValidatePortRange])
      ]
    });
  }

  addFilterEntry() {
    this.filterEntryFormSubmitted = true;
    if (this.filterEntryForm.invalid) {
      return;
    }

    const newFilterEntry = new FilterEntry(
      this.filterEntryForm.value.name,
      this.filterEntryForm.value.protocol,
      this.filterEntryForm.value.sourcePorts,
      this.filterEntryForm.value.destinationPorts
    );

    this.filterEntries.push(newFilterEntry);
    this.filterEntryFormSubmitted = false;
    this.buildFilterEntryForm();
  }

  removeFilterEntry(filterEntry: FilterEntry) {
    const index = this.filterEntries.indexOf(filterEntry);

    if (index > -1) {
      this.filterEntries.splice(index, 1);
    }
  }

  private unsubAll() {}

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.filterEntryFormSubmitted = false;
    this.buildForm();
    this.buildFilterEntryForm();
  }

  ngOnInit() {
    this.buildForm();
    this.buildFilterEntryForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
