import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IpAddressIpValidator, ValidatePortRange, IpAddressAnyValidator, FqdnValidator } from 'src/app/validators/network-form-validators';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { NetworkObjectModalHelpText } from 'src/app/helptext/help-text-networking';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { V1NetworkSecurityNetworkObjectsService, NetworkObject, NetworkObjectTypeEnum } from 'client';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-network-object-modal',
  templateUrl: './network-object-modal.component.html',
})
export class NetworkObjectModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  networkTypeSubscription: Subscription;
  natSubscription: Subscription;
  TierId: string;
  NetworkObjectId: string;
  ModalMode: ModalMode;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: NetworkObjectModalHelpText,
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const modalNetworkObject = {} as NetworkObject;

    modalNetworkObject.name = this.form.value.name;

    const networkObjectType = this.form.getRawValue().type;

    if (networkObjectType === NetworkObjectTypeEnum.IpAddress) {
      modalNetworkObject.ipAddress = this.form.value.ipAddress;
    } else if (networkObjectType === NetworkObjectTypeEnum.Range) {
      modalNetworkObject.startIpAddress = this.form.value.startIpAddress;
      modalNetworkObject.endIpAddress = this.form.value.endIpAddress;
    } else if (networkObjectType === NetworkObjectTypeEnum.Fqdn) {
      modalNetworkObject.fqdn = this.form.value.fqdn;
    }

    if (this.ModalMode === ModalMode.Create) {
      modalNetworkObject.tierId = this.TierId;
      modalNetworkObject.type = networkObjectType;
      this.networkObjectService
        .createOneNetworkObject({
          networkObject: modalNetworkObject,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.networkObjectService
        .updateOneNetworkObject({
          id: this.NetworkObjectId,
          networkObject: modalNetworkObject,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    }
  }

  private closeModal() {
    this.ngx.close('networkObjectModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('networkObjectModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  private setFormValidators() {
    const ipAddress = this.form.get('ipAddress');
    const startIpAddress = this.form.get('startIpAddress');
    const endIpAddress = this.form.get('endIpAddress');
    const fqdn = this.form.get('fqdn');

    this.networkTypeSubscription = this.form.get('type').valueChanges.subscribe(type => {
      if (type === 'IpAddress') {
        ipAddress.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));
        startIpAddress.setValidators(null);
        startIpAddress.setValue(null);
        endIpAddress.setValidators(null);
        endIpAddress.setValue(null);

        fqdn.setValidators(null);
        fqdn.setValue(null);
      }

      if (type === 'Range') {
        startIpAddress.setValidators(Validators.compose([Validators.required, IpAddressIpValidator]));
        startIpAddress.setValue(null);
        endIpAddress.setValidators(Validators.compose([Validators.required, IpAddressIpValidator]));
        endIpAddress.setValue(null);

        ipAddress.setValidators(null);
        ipAddress.setValue(null);

        fqdn.setValidators(null);
        fqdn.setValue(null);
      }

      if (type === 'Fqdn') {
        ipAddress.setValidators(null);
        ipAddress.setValue(null);
        startIpAddress.setValidators(null);
        startIpAddress.setValue(null);
        endIpAddress.setValidators(null);
        endIpAddress.setValue(null);

        fqdn.setValidators(Validators.compose([Validators.required, FqdnValidator]));
      }

      ipAddress.updateValueAndValidity();
      startIpAddress.updateValueAndValidity();
      endIpAddress.updateValueAndValidity();
      fqdn.updateValueAndValidity();
    });
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('networkObjectModal') as NetworkObjectModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    this.ModalMode = dto.ModalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.NetworkObjectId = dto.NetworkObject.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    const networkObject = dto.NetworkObject;

    if (networkObject !== undefined) {
      this.form.controls.name.setValue(networkObject.name);
      this.form.controls.name.disable();
      this.form.controls.type.setValue(networkObject.type);
      this.form.controls.type.disable();
      this.form.controls.ipAddress.setValue(networkObject.ipAddress);

      this.form.controls.startIpAddress.setValue(networkObject.startIpAddress);
      this.form.controls.endIpAddress.setValue(networkObject.endIpAddress);

      this.form.controls.fqdn.setValue(networkObject.fqdn);
    }
    this.ngx.resetModalData('networkObjectModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      type: ['', Validators.required],
      ipAddress: [''],
      startIpAddress: [''],
      endIpAddress: [''],
      fqdn: [''],
    });
  }

  private unsubAll() {
    SubscriptionUtil.unsubscribe([this.networkTypeSubscription, this.natSubscription]);
  }

  public reset() {
    this.unsubAll();
    this.submitted = false;
    this.TierId = '';
    this.NetworkObjectId = '';
    this.ngx.resetModalData('networkObjectModal');
    this.buildForm();
    this.setFormValidators();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
