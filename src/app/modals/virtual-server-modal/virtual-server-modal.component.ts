import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ValidateIpv4Any } from 'src/app/validators/network-form-validators';
import { VirtualServerModalDto } from 'src/app/models/loadbalancer/virtual-server-modal-dto';
import { VirtualServerModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  LoadBalancerPool,
  LoadBalancerIrule,
  LoadBalancerVirtualServer,
  V1LoadBalancerVirtualServersService,
  LoadBalancerProfile,
  V1TiersService,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-virtual-server-modal',
  templateUrl: './virtual-server-modal.component.html',
})
export class VirtualServerModalComponent implements OnInit, OnDestroy {
  form: FormGroup;
  submitted: boolean;
  pools: LoadBalancerPool[];
  TierId: string;
  VirtualServer: LoadBalancerVirtualServer;
  ModalMode: ModalMode;
  VirtualServerId: string;
  Pools: LoadBalancerPool[];

  availableIRules: LoadBalancerIrule[];
  selectedIRules: LoadBalancerIrule[];
  availableProfiles: LoadBalancerProfile[];
  selectedProfiles: LoadBalancerProfile[];

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private tierService: V1TiersService,
    private virtualServerService: V1LoadBalancerVirtualServersService,
    public helpText: VirtualServerModalHelpText,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const virtualServer = {} as LoadBalancerVirtualServer;
    virtualServer.name = this.form.value.name;
    virtualServer.type = this.form.value.type;
    virtualServer.sourceIpAddress = this.form.value.sourceAddress;
    virtualServer.destinationIpAddress = this.form.value.destinationAddress;
    virtualServer.servicePort = this.form.value.servicePort;
    virtualServer.defaultPoolId = this.form.value.pool;
    virtualServer.sourceAddressTranslation = this.form.value.sourceAddressTranslation;

    if (this.ModalMode === ModalMode.Create) {
      virtualServer.tierId = this.TierId;
      this.virtualServerService
        .v1LoadBalancerVirtualServersPost({
          loadBalancerVirtualServer: virtualServer,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.virtualServerService
        .v1LoadBalancerVirtualServersIdPut({
          id: this.VirtualServerId,
          loadBalancerVirtualServer: virtualServer,
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
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('virtualServerModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  addIRule() {
    this.virtualServerService
      .v1LoadBalancerVirtualServersVirtualServerIdIrulesIruleIdPost({
        virtualServerId: this.VirtualServerId,
        iruleId: this.f.selectedIRule.value,
      })
      .subscribe(data => {
        this.getVirtualServerIRulesProfiles();
        this.f.selectedIRule.setValue('');
      });
  }

  removeIRule(irule: LoadBalancerIrule) {
    const modalDto = new YesNoModalDto('Remove IRule from Virtual Server', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.virtualServerService
            .v1LoadBalancerVirtualServersVirtualServerIdIrulesIruleIdDelete({
              virtualServerId: this.VirtualServerId,
              iruleId: irule.id,
            })
            .subscribe(data => {
              this.getVirtualServerIRulesProfiles();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  addProfile() {
    this.virtualServerService
      .v1LoadBalancerVirtualServersVirtualServerIdProfilesProfileIdPost({
        virtualServerId: this.VirtualServerId,
        profileId: this.f.selectedProfile.value,
      })
      .subscribe(data => {
        this.getVirtualServerIRulesProfiles();
        this.f.selectedProfile.setValue('');
      });
  }

  removeProfile(profile: LoadBalancerProfile) {
    const modalDto = new YesNoModalDto(
      'Remove Profile from Virtual Server',
      '',
    );
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.virtualServerService
            .v1LoadBalancerVirtualServersVirtualServerIdProfilesProfileIdDelete(
              {
                virtualServerId: this.VirtualServerId,
                profileId: profile.id,
              },
            )
            .subscribe(data => {
              this.getVirtualServerIRulesProfiles();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private setFormValidators() {}

  getData() {
    const dto = Object.assign(
      {},
      this.ngx.getModalData('virtualServerModal') as VirtualServerModalDto,
    );

    this.pools = dto.Pools;
    if (dto.TierId) {
      this.TierId = dto.TierId;
    }
    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.VirtualServerId = dto.VirtualServer.id;
      }
    }

    const virtualServer = dto.VirtualServer;

    if (virtualServer !== undefined) {
      this.form.controls.name.setValue(virtualServer.name);
      this.form.controls.type.setValue(virtualServer.type);
      this.form.controls.sourceAddress.setValue(virtualServer.sourceIpAddress);
      this.form.controls.destinationAddress.setValue(
        virtualServer.destinationIpAddress,
      );
      this.form.controls.servicePort.setValue(virtualServer.servicePort);
      this.form.controls.sourceAddressTranslation.setValue(
        virtualServer.sourceAddressTranslation,
      );
      this.form.controls.pool.setValue(virtualServer.defaultPoolId);

      this.getTierIRulesProfiles();
      this.getVirtualServerIRulesProfiles();
      // TODO: Get Policies
      this.ngx.resetModalData('virtualServerModal');
    }
  }

  private getTierIRulesProfiles() {
    this.tierService
      .v1TiersIdGet({
        id: this.TierId,
        join: 'loadBalancerIrules,loadBalancerProfiles',
      })
      .subscribe(data => {
        this.availableIRules = data.loadBalancerIrules;
        this.availableProfiles = data.loadBalancerProfiles;
      });
  }

  private getVirtualServerIRulesProfiles() {
    this.virtualServerService
      .v1LoadBalancerVirtualServersIdGet({
        id: this.VirtualServerId,
        join: 'irules,profiles',
      })
      .subscribe(data => {
        this.selectedIRules = data.irules;
        this.selectedProfiles = data.profiles;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      sourceAddress: ['', Validators.compose([ValidateIpv4Any])],
      sourceAddressTranslation: [''],
      destinationAddress: [
        '',
        Validators.compose([Validators.required, ValidateIpv4Any]),
      ],
      servicePort: [
        '',
        Validators.compose([
          Validators.required,
          Validators.min(1),
          Validators.max(65535),
        ]),
      ],
      pool: ['', Validators.required],
      selectedIRule: [''],
      selectedProfile: [''],
    });

    this.availableIRules = new Array<LoadBalancerIrule>();
    this.selectedIRules = new Array<LoadBalancerIrule>();
    this.availableProfiles = new Array<LoadBalancerProfile>();
    this.selectedProfiles = new Array<LoadBalancerProfile>();
  }

  private unsubAll() {}

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
