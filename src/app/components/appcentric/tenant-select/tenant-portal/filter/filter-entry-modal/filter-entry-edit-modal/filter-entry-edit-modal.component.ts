import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  FilterEntry,
  FilterEntryArpFlagEnum,
  FilterEntryEtherTypeEnum,
  FilterEntryIpProtocolEnum,
  FilterEntryTcpFlagsEnum,
  V2AppCentricFilterEntriesService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-filter-entry-edit-modal',
  templateUrl: './filter-entry-edit-modal.component.html',
  styleUrls: ['./filter-entry-edit-modal.component.css'],
})
export class FilterEntryEditModalComponent implements OnInit {
  public filterEntryId: string;
  public form: FormGroup;
  public submitted: boolean;

  public etherTypeOptions = Object.keys(FilterEntryEtherTypeEnum);
  public arpFlagOptions = Object.keys(FilterEntryArpFlagEnum);
  public ipProtocolOptions = Object.keys(FilterEntryIpProtocolEnum);
  public tcpFlagsOptions = Object.keys(FilterEntryTcpFlagsEnum).map(key => ({ value: key, label: key }));

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private filterEntriesService: V2AppCentricFilterEntriesService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('filterEntryEditModal');
    this.reset();
  }

  public getData(): void {
    const filterEnry = Object.assign({}, this.ngx.getModalData('filterEntryEditModal') as FilterEntry);

    this.filterEntryId = filterEnry.id;

    if (filterEnry !== undefined) {
      this.form.controls.name.setValue(filterEnry.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(filterEnry.description);
      this.form.controls.alias.setValue(filterEnry.alias);
      this.form.controls.etherType.setValue(filterEnry.etherType);
      this.form.controls.arpFlag.setValue(filterEnry.arpFlag);
      this.form.controls.ipProtocol.setValue(filterEnry.ipProtocol);
      this.form.controls.matchOnlyFragments.setValue(filterEnry.matchOnlyFragments);
      this.form.controls.sourceFromPort.setValue(filterEnry.sourceFromPort);
      this.form.controls.sourceToPort.setValue(filterEnry.sourceToPort);
      this.form.controls.destinationFromPort.setValue(filterEnry.destinationFromPort);
      this.form.controls.destinationToPort.setValue(filterEnry.destinationToPort);
      this.form.controls.tcpFlags.setValue(filterEnry.tcpFlags);
      this.form.controls.stateful.setValue(filterEnry.stateful);
    }
    this.ngx.resetModalData('filterEntryEditModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('filterEntryEditModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      etherType: [null],
      arpFlag: [null],
      ipProtocol: [null],
      matchOnlyFragments: [null],
      sourceFromPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      sourceToPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      destinationFromPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      destinationToPort: ['', Validators.compose([Validators.min(0), Validators.max(65535)])],
      tcpFlags: [null],
      stateful: [null],
    });
  }

  private editFilterEntry(filterEntry: FilterEntry): void {
    filterEntry.name = null;
    filterEntry.tenantId = null;
    this.filterEntriesService
      .updateFilterEntry({
        uuid: this.filterEntryId,
        filterEntry,
      })
      .subscribe(
        () => {},
        () => {},
        () => this.closeModal(),
      );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const {
      name,
      description,
      alias,
      etherType,
      arpFlag,
      ipProtocol,
      matchOnlyFragments,
      sourceFromPort,
      sourceToPort,
      destinationFromPort,
      destinationToPort,
      tcpFlags,
      stateful,
    } = this.form.value;
    const filterEntry = {
      name,
      description,
      alias,
      etherType,
      arpFlag,
      ipProtocol,
      matchOnlyFragments,
      sourceFromPort,
      sourceToPort,
      destinationFromPort,
      destinationToPort,
      tcpFlags,
      stateful,
    } as FilterEntry;

    this.editFilterEntry(filterEntry);
  }

  onTcpFlagSelected(selected: any[]) {
    const tcpFlagControl = 'tcpFlags';
    const tcpFlags = this.form.controls[tcpFlagControl] as FormArray;
    const selectedValues = selected.map(item => item.value);
    tcpFlags.setValue(selectedValues);
  }
}
