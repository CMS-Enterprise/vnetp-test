import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IpAddressIpValidator, ValidatePortRange, IpAddressAnyValidator } from 'src/app/validators/network-form-validators';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { NetworkObjectModalHelpText } from 'src/app/helptext/help-text-networking';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { V1NetworkSecurityNetworkObjectsService, NetworkObject, NetworkObjectType } from 'api_client';

@Component({
  selector: 'app-network-object-modal',
  templateUrl: './network-object-modal.component.html',
})
export class NetworkObjectModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  networkTypeSubscription: Subscription;
  natSubscription: Subscription;
  natServiceSubscription: Subscription;
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
    modalNetworkObject.type = this.form.getRawValue().type;

    if (modalNetworkObject.type === NetworkObjectType.IpAddress) {
      modalNetworkObject.ipAddress = this.form.value.ipAddress;
    } else if (modalNetworkObject.type === NetworkObjectType.Range) {
      modalNetworkObject.startIpAddress = this.form.value.startIpAddress;
      modalNetworkObject.endIpAddress = this.form.value.endIpAddress;
    }

    modalNetworkObject.nat = this.form.value.nat;

    if (modalNetworkObject.nat) {
      modalNetworkObject.translatedIpAddress = this.form.value.translatedIpAddress;
      modalNetworkObject.natDirection = this.form.value.natDirection;
      modalNetworkObject.natType = this.form.value.natType;
    }

    modalNetworkObject.natService = this.form.value.natService;

    if (modalNetworkObject.natService) {
      modalNetworkObject.natProtocol = this.form.value.natProtocol;
      modalNetworkObject.natSourcePort = this.form.value.natSourcePort;
      modalNetworkObject.natTranslatedPort = this.form.value.natTranslatedPort;
    }

    if (this.ModalMode === ModalMode.Create) {
      modalNetworkObject.tierId = this.TierId;
      this.networkObjectService
        .v1NetworkSecurityNetworkObjectsPost({
          networkObject: modalNetworkObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      modalNetworkObject.type = null;
      this.networkObjectService
        .v1NetworkSecurityNetworkObjectsIdPut({
          id: this.NetworkObjectId,
          networkObject: modalNetworkObject,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
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
    const nat = this.form.get('nat');

    this.networkTypeSubscription = this.form.get('type').valueChanges.subscribe(type => {
      if (type === 'IpAddress') {
        ipAddress.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));
        startIpAddress.setValidators(null);
        startIpAddress.setValue(null);
        endIpAddress.setValidators(null);
        endIpAddress.setValue(null);
      }

      if (type === 'Range') {
        startIpAddress.setValidators(Validators.compose([Validators.required, IpAddressIpValidator]));
        startIpAddress.setValue(null);
        endIpAddress.setValidators(Validators.compose([Validators.required, IpAddressIpValidator]));
        endIpAddress.setValue(null);

        ipAddress.setValidators(null);
        ipAddress.setValue(null);
        nat.setValue(false);
      }

      ipAddress.updateValueAndValidity();
      startIpAddress.updateValueAndValidity();
      endIpAddress.updateValueAndValidity();
      nat.updateValueAndValidity({ emitEvent: false });
    });

    this.natSubscription = this.form.get('nat').valueChanges.subscribe(natValue => {
      if (natValue) {
        this.form.controls.type.setValue('IpAddress');
        this.form.controls.type.updateValueAndValidity();
        this.form.controls.translatedIpAddress.setValidators(Validators.compose([Validators.required, IpAddressAnyValidator]));
        this.form.controls.natDirection.setValidators(Validators.compose([Validators.required]));
        this.form.controls.natType.setValidators(Validators.compose([Validators.required]));
      } else if (!natValue) {
        this.form.controls.translatedIpAddress.setValue(null);
        this.form.controls.translatedIpAddress.setValidators(null);
        this.form.controls.natDirection.setValue(null);
        this.form.controls.natDirection.setValidators(null);
        this.form.controls.natType.setValue(null);
        this.form.controls.natType.setValidators(null);
      }

      this.form.controls.translatedIpAddress.updateValueAndValidity();
      this.form.controls.natType.updateValueAndValidity();
      this.form.controls.natDirection.updateValueAndValidity();
    });

    this.natServiceSubscription = this.form.get('natService').valueChanges.subscribe(natService => {
      if (natService) {
        this.form.controls.natProtocol.setValidators(Validators.compose([Validators.required]));
        this.form.controls.natSourcePort.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
        this.form.controls.natTranslatedPort.setValidators(Validators.compose([Validators.required, ValidatePortRange]));
      } else if (!natService) {
        this.form.controls.natProtocol.setValue(null);
        this.form.controls.natProtocol.setValidators(null);
        this.form.controls.natSourcePort.setValue(null);
        this.form.controls.natSourcePort.setValidators(null);
        this.form.controls.natTranslatedPort.setValue(null);
        this.form.controls.natTranslatedPort.setValidators(null);
      }

      this.form.controls.natProtocol.updateValueAndValidity();
      this.form.controls.natSourcePort.updateValueAndValidity();
      this.form.controls.natTranslatedPort.updateValueAndValidity();
    });
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('networkObjectModal') as NetworkObjectModalDto);

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.NetworkObjectId = dto.NetworkObject.id;
      } else {
        this.form.controls.name.enable();
        this.form.controls.type.enable();
      }
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

      this.form.controls.nat.setValue(networkObject.nat);

      this.form.controls.natType.setValue(networkObject.natType);
      this.form.controls.natDirection.setValue(networkObject.natDirection);
      this.form.controls.translatedIpAddress.setValue(networkObject.translatedIpAddress);

      this.form.controls.natService.setValue(networkObject.natService);

      this.form.controls.natProtocol.setValue(networkObject.natProtocol);
      this.form.controls.natSourcePort.setValue(networkObject.natSourcePort);
      this.form.controls.natTranslatedPort.setValue(networkObject.natTranslatedPort);
    }
    this.ngx.resetModalData('networkObjectModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      type: ['', Validators.required],
      ipAddress: [''],
      startIpAddress: [''],
      endIpAddress: [''],
      nat: [false],
      natType: [''],
      natDirection: [''],
      translatedIpAddress: [''],
      natService: [false],
      natProtocol: [''],
      natSourcePort: [''],
      natTranslatedPort: [''],
    });
  }

  private unsubAll() {
    [this.networkTypeSubscription, this.natSubscription, this.natServiceSubscription].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
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
