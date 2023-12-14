import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
  FilterEntry,
  FilterEntryArpFlagEnum,
  FilterEntryEtherTypeEnum,
  FilterEntryIpProtocolEnum,
  V2AppCentricFilterEntriesService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { NameValidator } from 'src/app/validators/name-validator';
import { FilterEntryModalDto } from '../../../../../../../models/appcentric/filter-entry-modal.dto';
import { ModalMode } from '../../../../../../../models/other/modal-mode';
import FormUtil from '../../../../../../../utils/FormUtil';
import SubscriptionUtil from '../../../../../../../utils/SubscriptionUtil';

@Component({
  selector: 'app-filter-entry-modal',
  templateUrl: './filter-entry-modal.component.html',
  styleUrls: ['./filter-entry-modal.component.css'],
})
export class FilterEntryModalComponent implements OnInit, OnDestroy {
  public filterEntryId: string;
  @Input() public tenantId: string;
  public filterId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public modalMode: ModalMode;

  private etherTypeSubscription: Subscription;
  private ipProtocolSubscription: Subscription;
  private sourceFromPortSubscription: Subscription;
  private destinationFromPortSubscription: Subscription;

  public etherTypeOptions = Object.values(FilterEntryEtherTypeEnum);
  public arpFlagOptions = Object.values(FilterEntryArpFlagEnum);
  public ipProtocolOptions = Object.values(FilterEntryIpProtocolEnum);

  constructor(
    private formBuilder: UntypedFormBuilder,
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
    this.ngx.close('filterEntryModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('filterEntryModal') as FilterEntryModalDto);

    this.modalMode = dto.modalMode;
    this.filterId = dto.filterId;

    this.form.controls.arpFlag.disable();
    this.form.controls.ipProtocol.disable();
    this.form.controls.matchOnlyFragments.disable();
    this.form.controls.sourceFromPort.disable();
    this.form.controls.sourceToPort.disable();
    this.form.controls.destinationFromPort.disable();
    this.form.controls.destinationToPort.disable();
    this.form.controls.stateful.disable();

    if (this.modalMode === ModalMode.Edit) {
      this.filterEntryId = dto.filterEntry.id;
      this.form.controls.name.disable();
    } else {
      this.form.controls.name.enable();
    }

    const filterEntry = dto?.filterEntry;

    if (filterEntry !== undefined) {
      this.form.controls.name.setValue(filterEntry.name);
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
      this.form.controls.stateful.setValue(filterEntry.stateful);
    }
    this.ngx.resetModalData('filterEntryModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('filterEntryModal');
    this.buildForm();
    this.setFormValidators();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      etherType: [],
      arpFlag: [null],
      ipProtocol: [null],
      matchOnlyFragments: [null],
      sourceFromPort: [null, Validators.compose([Validators.min(0), Validators.max(65535)])],
      sourceToPort: [null, Validators.compose([Validators.min(0), Validators.max(65535)])],
      destinationFromPort: [null, Validators.compose([Validators.min(0), Validators.max(65535)])],
      destinationToPort: [null, Validators.compose([Validators.min(0), Validators.max(65535)])],
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

    this.etherTypeSubscription = etherType.valueChanges.subscribe(etherTypeValue => {
      // ipProtocol and matchOnlyFragments are required when etherType is IP, IPv4 or IPv6
      if (etherTypeValue === 'ip' || etherTypeValue === 'ipv4' || etherTypeValue === 'ipv6') {
        ipProtocol.enable();
        ipProtocol.setValue(null);
        matchOnlyFragments.enable();
        matchOnlyFragments.setValidators(Validators.required);
        matchOnlyFragments.setValue(false);
      } else {
        ipProtocol.disable();
        ipProtocol.setValue(null);
        matchOnlyFragments.disable();
        matchOnlyFragments.setValidators(null);
        matchOnlyFragments.setValue(null);
      }

      // ArpFlag must be set when etherType is ARP.
      if (etherTypeValue === 'arp') {
        arpFlag.enable();
        arpFlag.setValidators(Validators.required);
        arpFlag.setValue(null);
      } else {
        arpFlag.disable();
        arpFlag.setValidators(null);
        arpFlag.setValue(null);
      }

      arpFlag.updateValueAndValidity();
      matchOnlyFragments.updateValueAndValidity();
      ipProtocol.updateValueAndValidity();
    });

    this.ipProtocolSubscription = ipProtocol.valueChanges.subscribe(ipProtocolValue => {
      // When ipProtocol is Tcp or Udp, source and destination from/to ports must be set.
      if (ipProtocolValue === 'tcp' || ipProtocolValue === 'udp') {
        sourceFromPort.enable();
        sourceToPort.enable();
        destinationFromPort.enable();
        destinationToPort.enable();

        sourceFromPort.setValidators(Validators.compose([Validators.min(0), Validators.max(65535)]));
        sourceToPort.setValidators(Validators.compose([Validators.min(0), Validators.max(65535)]));
        destinationFromPort.setValidators(Validators.compose([Validators.min(0), Validators.max(65535)]));
        destinationToPort.setValidators(Validators.compose([Validators.min(0), Validators.max(65535)]));
        if (ipProtocolValue === 'tcp') {
          stateful.enable();
          stateful.setValue(false);
          stateful.setValidators(Validators.required);
        } else if (ipProtocolValue === 'udp') {
          stateful.disable();
          stateful.setValue(null);
          stateful.setValidators(null);
        }
      } else {
        sourceFromPort.disable();
        sourceToPort.disable();
        destinationFromPort.disable();
        destinationToPort.disable();
        stateful.disable();

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
    });

    this.sourceFromPortSubscription = sourceFromPort.valueChanges.subscribe(sourceFromPortValue => {
      if (sourceFromPortValue !== null) {
        sourceToPort.setValidators(Validators.compose([Validators.min(sourceFromPortValue), Validators.max(65535), Validators.required]));
        sourceToPort.updateValueAndValidity();
      } else {
        sourceToPort.setValidators(Validators.compose([Validators.min(sourceFromPortValue), Validators.max(65535)]));
        sourceToPort.updateValueAndValidity();
      }
    });

    this.destinationFromPortSubscription = destinationFromPort.valueChanges.subscribe(destinationFromPortValue => {
      if (destinationFromPortValue !== null) {
        destinationToPort.setValidators(
          Validators.compose([Validators.min(destinationFromPortValue), Validators.max(65535), Validators.required]),
        );
        destinationToPort.updateValueAndValidity();
      } else {
        destinationToPort.setValidators(Validators.compose([Validators.min(destinationFromPortValue), Validators.max(65535)]));
        destinationToPort.updateValueAndValidity();
      }
    });
  }

  private createFilterEntry(filterEntry: FilterEntry): void {
    filterEntry.filterId = this.filterId;
    filterEntry.tenantId = this.tenantId;
    this.filterEntriesService.createOneFilterEntry({ filterEntry }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editFilterEntry(filterEntry: FilterEntry): void {
    filterEntry.name = null;
    filterEntry.tenantId = null;
    this.filterEntriesService
      .updateOneFilterEntry({
        id: this.filterEntryId,
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
      console.log(FormUtil.findInvalidControls(this.form));
      return;
    }

    const filterId = this.filterId;
    const tenantId = this.tenantId;

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
      stateful,
      filterId,
      tenantId,
    } as FilterEntry;

    if (this.modalMode === ModalMode.Create) {
      this.createFilterEntry(filterEntry);
    } else {
      delete filterEntry.tenantId;
      delete filterEntry.filterId;
      delete filterEntry.name;
      this.editFilterEntry(filterEntry);
    }
  }

  ngOnDestroy() {
    this.unsubAll();
    this.reset();
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
