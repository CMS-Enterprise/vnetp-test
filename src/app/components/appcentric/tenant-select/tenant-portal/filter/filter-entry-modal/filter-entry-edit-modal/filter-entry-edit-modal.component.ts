import { Component, OnDestroy, OnInit } from '@angular/core';
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
import { Subscription } from 'rxjs';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from '../../../../../../../utils/SubscriptionUtil';

@Component({
  selector: 'app-filter-entry-edit-modal',
  templateUrl: './filter-entry-edit-modal.component.html',
  styleUrls: ['./filter-entry-edit-modal.component.css'],
})
export class FilterEntryEditModalComponent implements OnInit, OnDestroy {
  public filterEntryId: string;
  public form: FormGroup;
  public submitted: boolean;

  private etherTypeSubscription: Subscription;
  private ipProtocolSubscription: Subscription;
  private sourceFromPortSubscription: Subscription;
  private destinationFromPortSubscription: Subscription;

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
    this.setFormValidators();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('filterEntryEditModal');
    this.reset();
  }

  public getData(): void {
    const filterEntry = Object.assign({}, this.ngx.getModalData('filterEntryEditModal') as FilterEntry);

    this.filterEntryId = filterEntry.id;

    if (filterEntry !== undefined) {
      this.form.controls.name.setValue(filterEntry.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(filterEntry.description);
      this.form.controls.alias.setValue(filterEntry.alias);
      this.form.controls.etherType.setValue(filterEntry.etherType);
      this.form.controls.arpFlag.setValue(filterEntry.arpFlag);
      this.form.controls.ipProtocol.setValue(filterEntry.ipProtocol);
      this.form.controls.matchOnlyFragments.setValue(filterEntry.matchOnlyFragments);
      this.form.controls.sourceFromPort.setValue(filterEntry.sourceFromPort);
      this.form.controls.sourceToPort.setValue(filterEntry.sourceToPort);
      this.form.controls.destinationFromPort.setValue(filterEntry.destinationFromPort);
      this.form.controls.destinationToPort.setValue(filterEntry.destinationToPort);
      this.form.controls.tcpFlags.setValue(filterEntry.tcpFlags);
      this.form.controls.stateful.setValue(filterEntry.stateful);
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

  public setFormValidators(): void {
    const arpFlag = this.form.controls.arpFlag;
    const etherType = this.form.controls.etherType;
    const ipProtocol = this.form.controls.ipProtocol;
    const matchOnlyFragments = this.form.controls.matchOnlyFragments;
    const sourceFromPort = this.form.controls.sourceFromPort;
    const sourceToPort = this.form.controls.sourceToPort;
    const destinationFromPort = this.form.controls.destinationFromPort;
    const destinationToPort = this.form.controls.destinationToPort;
    const stateful = this.form.controls.stateful;
    const tcpFlags = this.form.controls.tcpFlags;

    this.etherTypeSubscription = etherType.valueChanges.subscribe(etherTypeValue => {
      // ipProtocol and matchOnlyFragments are required when etherType is IP, IPv4 or IPv6
      if (etherTypeValue === 'Ip' || etherTypeValue === 'Ipv4' || etherTypeValue === 'Ipv6') {
        ipProtocol.setValidators(Validators.required);
        ipProtocol.setValue(null);
        matchOnlyFragments.setValidators(Validators.required);
        matchOnlyFragments.setValue(null);
      } else {
        ipProtocol.setValidators(null);
        ipProtocol.setValue(null);
        matchOnlyFragments.setValidators(null);
        matchOnlyFragments.setValue(null);
      }

      // ArpFlag must be set when etherType is ARP.
      if (etherTypeValue === 'Arp') {
        arpFlag.setValidators(Validators.required);
        arpFlag.setValue(null);
      } else {
        arpFlag.setValidators(null);
        arpFlag.setValue(null);
      }

      arpFlag.updateValueAndValidity();
      matchOnlyFragments.updateValueAndValidity();
      ipProtocol.updateValueAndValidity();
    });

    this.ipProtocolSubscription = ipProtocol.valueChanges.subscribe(ipProtocolValue => {
      // When ipProtocol is Tcp or Udp, source and destination from/to ports must be set.
      if (ipProtocolValue === 'Tcp' || ipProtocolValue === 'Udp') {
        sourceFromPort.enable();
        sourceToPort.enable();
        destinationFromPort.enable();
        destinationToPort.enable();
        stateful.enable();
        tcpFlags.enable();

        sourceFromPort.setValidators(Validators.required);
        sourceToPort.setValidators(Validators.required);
        destinationFromPort.setValidators(Validators.required);
        destinationToPort.setValidators(Validators.required);
        if (ipProtocolValue === 'Tcp') {
          stateful.setValidators(Validators.required);
          tcpFlags.setValidators(Validators.required);
        } else if (ipProtocolValue === 'Udp') {
          stateful.setValidators(null);
          tcpFlags.setValidators(null);
        }
      } else {
        sourceFromPort.disable();
        sourceToPort.disable();
        destinationFromPort.disable();
        destinationToPort.disable();
        stateful.disable();
        tcpFlags.disable();

        sourceFromPort.setValidators(null);
        sourceToPort.setValidators(null);
        destinationFromPort.setValidators(null);
        destinationToPort.setValidators(null);
        stateful.setValidators(null);
      }

      sourceFromPort.setValue(null);
      sourceToPort.setValue(null);
      destinationFromPort.setValue(null);
      destinationToPort.setValue(null);

      sourceFromPort.updateValueAndValidity();
      sourceToPort.updateValueAndValidity();
      destinationFromPort.updateValueAndValidity();
      destinationToPort.updateValueAndValidity();
      stateful.updateValueAndValidity();
      tcpFlags.updateValueAndValidity();
    });

    this.sourceFromPortSubscription = sourceFromPort.valueChanges.subscribe(sourceFromPortValue => {
      sourceToPort.setValidators(Validators.compose([Validators.min(sourceFromPortValue), Validators.max(65535), Validators.required]));
    });

    this.destinationFromPortSubscription = destinationFromPort.valueChanges.subscribe(destinationFromPortValue => {
      destinationToPort.setValidators(
        Validators.compose([Validators.min(destinationFromPortValue), Validators.max(65535), Validators.required]),
      );
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

  ngOnDestroy() {
    this.unsubAll();
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([
      this.etherTypeSubscription,
      this.ipProtocolSubscription,
      this.sourceFromPortSubscription,
      this.destinationFromPortSubscription,
    ]);
  }
}
