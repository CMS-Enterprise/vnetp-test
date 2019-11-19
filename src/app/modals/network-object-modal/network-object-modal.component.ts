import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import {
  ValidateIpv4Address,
  ValidateIpv4CidrAddress,
  ValidatePortRange,
} from 'src/app/validators/network-form-validators';
import { NetworkObjectModalDto } from 'src/app/models/network-objects/network-object-modal-dto';
import { Subnet } from 'src/app/models/d42/subnet';
import { NetworkObject } from 'src/app/models/network-objects/network-object';
import { NetworkObjectModalHelpText } from 'src/app/helptext/help-text-networking';

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
  Subnets: Array<Subnet>;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    public helpText: NetworkObjectModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const networkObject = new NetworkObject();
    networkObject.Name = this.form.value.name;
    networkObject.Type = this.form.getRawValue().type;
    networkObject.SourceSubnet = this.form.value.sourceSubnet;
    networkObject.DestinationSubnet = this.form.value.destinationSubnet;
    networkObject.HostAddress = this.form.value.hostAddress;
    networkObject.CidrAddress = this.form.value.cidrAddress;
    networkObject.StartAddress = this.form.value.startAddress;
    networkObject.EndAddress = this.form.value.endAddress;
    networkObject.Nat = this.form.value.nat;
    networkObject.TranslatedIpAddress = this.form.value.translatedIp;
    networkObject.NatService = this.form.value.natService;
    networkObject.NatProtocol = this.form.value.natProtocol;
    networkObject.SourcePort = this.form.value.sourcePort;
    networkObject.TranslatedPort = this.form.value.translatedPort;

    const dto = new NetworkObjectModalDto();
    dto.NetworkObject = networkObject;

    this.ngx.resetModalData('networkObjectModal');
    this.ngx.setModalData(Object.assign({}, dto), 'networkObjectModal');
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
    const cidrAddress = this.form.get('cidrAddress');
    const hostAddress = this.form.get('hostAddress');
    const startAddress = this.form.get('startAddress');
    const endAddress = this.form.get('endAddress');
    const nat = this.form.get('nat');

    this.networkTypeSubscription = this.form
      .get('type')
      .valueChanges.subscribe(type => {
        if (type === 'host') {
          hostAddress.setValidators(
            Validators.compose([Validators.required, ValidateIpv4Address]),
          );
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
          startAddress.setValidators(null);
          startAddress.setValue(null);
          endAddress.setValidators(null);
          endAddress.setValue(null);
        }

        if (type === 'range') {
          startAddress.setValidators(
            Validators.compose([Validators.required, ValidateIpv4Address]),
          );
          startAddress.setValue(null);
          endAddress.setValidators(
            Validators.compose([Validators.required, ValidateIpv4Address]),
          );
          endAddress.setValue(null);
          hostAddress.setValidators(null);
          hostAddress.setValue(null);
          cidrAddress.setValidators(null);
          cidrAddress.setValue(null);
          nat.setValue(false);
        }

        if (type === 'subnet') {
          cidrAddress.setValidators(
            Validators.compose([Validators.required, ValidateIpv4CidrAddress]),
          );
          hostAddress.setValidators(null);
          hostAddress.setValue(null);
          startAddress.setValidators(null);
          startAddress.setValue(null);
          endAddress.setValidators(null);
          endAddress.setValue(null);
          nat.setValue(false);
        }

        cidrAddress.updateValueAndValidity();
        hostAddress.updateValueAndValidity();
        startAddress.updateValueAndValidity();
        endAddress.updateValueAndValidity();
        nat.updateValueAndValidity({ emitEvent: false });
      });

    this.natSubscription = this.form
      .get('nat')
      .valueChanges.subscribe(natValue => {
        if (natValue) {
          this.form.controls.type.setValue('host');
          this.form.controls.type.updateValueAndValidity();
          this.form.controls.translatedIp.setValidators(
            Validators.compose([Validators.required, ValidateIpv4Address]),
          );
          this.form.controls.destinationSubnet.setValidators(
            Validators.compose([Validators.required]),
          );
          this.form.controls.sourceSubnet.setValidators(
            Validators.compose([Validators.required]),
          );
        } else if (!natValue) {
          this.form.controls.translatedIp.setValue(null);
          this.form.controls.translatedIp.setValidators(null);
          this.form.controls.destinationSubnet.setValue(null);
          this.form.controls.destinationSubnet.setValidators(null);
          this.form.controls.sourceSubnet.setValue(null);
          this.form.controls.sourceSubnet.setValidators(null);
        }

        this.form.controls.translatedIp.updateValueAndValidity();
        this.form.controls.sourceSubnet.updateValueAndValidity();
        this.form.controls.destinationSubnet.updateValueAndValidity();
      });

    this.natServiceSubscription = this.form
      .get('natService')
      .valueChanges.subscribe(natService => {
        if (natService) {
          this.form.controls.natProtocol.setValidators(
            Validators.compose([Validators.required]),
          );
          this.form.controls.sourcePort.setValidators(
            Validators.compose([Validators.required, ValidatePortRange]),
          );
          this.form.controls.translatedPort.setValidators(
            Validators.compose([Validators.required, ValidatePortRange]),
          );
        } else if (!natService) {
          this.form.controls.natProtocol.setValue(null);
          this.form.controls.natProtocol.setValidators(null);
          this.form.controls.sourcePort.setValue(null);
          this.form.controls.sourcePort.setValidators(null);
          this.form.controls.translatedPort.setValue(null);
          this.form.controls.translatedPort.setValidators(null);
        }

        this.form.controls.natProtocol.updateValueAndValidity();
        this.form.controls.sourcePort.updateValueAndValidity();
        this.form.controls.translatedPort.updateValueAndValidity();
      });
  }

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('networkObjectModal') as NetworkObjectModalDto,
    );

    if (dto.Subnets) {
      this.Subnets = dto.Subnets;
    }

    const networkObject = dto.NetworkObject;

    if (networkObject !== undefined) {
      this.form.controls.name.setValue(networkObject.Name);
      this.form.controls.type.setValue(networkObject.Type);
      this.form.controls.sourceSubnet.setValue(networkObject.SourceSubnet);
      this.form.controls.destinationSubnet.setValue(
        networkObject.DestinationSubnet,
      );
      this.form.controls.hostAddress.setValue(networkObject.HostAddress);
      this.form.controls.cidrAddress.setValue(networkObject.CidrAddress);
      this.form.controls.startAddress.setValue(networkObject.StartAddress);
      this.form.controls.endAddress.setValue(networkObject.EndAddress);
      this.form.controls.nat.setValue(networkObject.Nat);
      this.form.controls.translatedIp.setValue(
        networkObject.TranslatedIpAddress,
      );
      this.form.controls.natService.setValue(networkObject.NatService);
      this.form.controls.natProtocol.setValue(networkObject.NatProtocol);
      this.form.controls.sourcePort.setValue(networkObject.SourcePort);
      this.form.controls.translatedPort.setValue(networkObject.TranslatedPort);
    }
    this.ngx.resetModalData('networkObjectModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      ipVersion: [''],
      cidrAddress: [''],
      hostAddress: [''],
      startAddress: [''],
      endAddress: [''],
      sourceSubnet: [''],
      destinationSubnet: [''],
      nat: [false],
      translatedIp: [''],
      natService: [false],
      natProtocol: [''],
      sourcePort: [''],
      translatedPort: [''],
    });
  }

  private unsubAll() {
    [
      this.networkTypeSubscription,
      this.natSubscription,
      this.natServiceSubscription,
    ].forEach(sub => {
      try {
        if (sub) {
          sub.unsubscribe();
        }
      } catch (e) {
        console.error(e);
      }
    });
  }

  private reset() {
    this.unsubAll();
    this.submitted = false;
    this.Subnets = new Array<Subnet>();
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
