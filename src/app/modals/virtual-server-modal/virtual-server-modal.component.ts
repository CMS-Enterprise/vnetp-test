import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { VirtualServerModalDto } from 'src/app/models/loadbalancer/virtual-server-modal-dto';
import { VirtualServerModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  LoadBalancerPool,
  LoadBalancerIrule,
  LoadBalancerVirtualServer,
  V1LoadBalancerVirtualServersService,
  LoadBalancerProfile,
  V1TiersService,
  LoadBalancerPolicy,
} from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { IpAddressCidrValidator, IpAddressAnyValidator } from 'src/app/validators/network-form-validators';

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
  availablePolicies: LoadBalancerPolicy[];
  selectedPolicies: LoadBalancerPolicy[];

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
        this.getVirtualServerIRulesProfilesPolicies();
        this.f.selectedIRule.setValue('');
      });
  }

  removeIRule(irule: LoadBalancerIrule) {
    const modalDto = new YesNoModalDto('Remove IRule from Virtual Server', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        this.virtualServerService
          .v1LoadBalancerVirtualServersVirtualServerIdIrulesIruleIdDelete({
            virtualServerId: this.VirtualServerId,
            iruleId: irule.id,
          })
          .subscribe(result => {
            this.getVirtualServerIRulesProfilesPolicies();
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
        this.getVirtualServerIRulesProfilesPolicies();
        this.f.selectedProfile.setValue('');
      });
  }

  removeProfile(profile: LoadBalancerProfile) {
    const modalDto = new YesNoModalDto('Remove Profile from Virtual Server', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        this.virtualServerService
          .v1LoadBalancerVirtualServersVirtualServerIdProfilesProfileIdDelete({
            virtualServerId: this.VirtualServerId,
            profileId: profile.id,
          })
          .subscribe(result => {
            this.getVirtualServerIRulesProfilesPolicies();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  addPolicy() {
    this.virtualServerService
      .v1LoadBalancerVirtualServersVirtualServerIdPoliciesPolicyIdPost({
        virtualServerId: this.VirtualServerId,
        policyId: this.f.selectedPolicy.value,
      })
      .subscribe(data => {
        this.getVirtualServerIRulesProfilesPolicies();
        this.f.selectedPolicy.setValue('');
      });
  }

  removePolicy(policy: LoadBalancerPolicy) {
    const modalDto = new YesNoModalDto('Remove Policy from Virtual Server', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx.getModal('yesNoModal').onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
      const data = modal.getData() as YesNoModalDto;
      modal.removeData();
      if (data && data.modalYes) {
        this.virtualServerService
          .v1LoadBalancerVirtualServersVirtualServerIdPoliciesPolicyIdDelete({
            virtualServerId: this.VirtualServerId,
            policyId: policy.id,
          })
          .subscribe(result => {
            this.getVirtualServerIRulesProfilesPolicies();
          });
      }
      yesNoModalSubscription.unsubscribe();
    });
  }

  getData() {
    const dto = Object.assign({}, this.ngx.getModalData('virtualServerModal') as VirtualServerModalDto);

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
      } else {
        this.form.controls.name.enable();
        this.form.controls.type.enable();
      }
    }

    const virtualServer = dto.VirtualServer;

    if (virtualServer !== undefined) {
      this.form.controls.name.setValue(virtualServer.name);
      this.form.controls.name.disable();
      this.form.controls.type.setValue(virtualServer.type);
      this.form.controls.type.disable();
      this.form.controls.sourceAddress.setValue(virtualServer.sourceIpAddress);
      this.form.controls.destinationAddress.setValue(virtualServer.destinationIpAddress);
      this.form.controls.servicePort.setValue(virtualServer.servicePort);
      this.form.controls.sourceAddressTranslation.setValue(virtualServer.sourceAddressTranslation);
      this.form.controls.pool.setValue(virtualServer.defaultPoolId);

      this.getTierIRulesProfilesPolicies();
      this.getVirtualServerIRulesProfilesPolicies();
    }
    this.ngx.resetModalData('virtualServerModal');
  }

  private getTierIRulesProfilesPolicies() {
    this.tierService
      .v1TiersIdGet({
        id: this.TierId,
        join: 'loadBalancerIrules,loadBalancerProfiles,loadBalancerPolicies',
      })
      .subscribe(data => {
        this.availableIRules = data.loadBalancerIrules;
        this.availableProfiles = data.loadBalancerProfiles;
        this.availablePolicies = data.loadBalancerPolicies;
      });
  }

  private getVirtualServerIRulesProfilesPolicies() {
    this.virtualServerService
      .v1LoadBalancerVirtualServersIdGet({
        id: this.VirtualServerId,
        join: 'irules,profiles,policies',
      })
      .subscribe(data => {
        this.selectedIRules = data.irules;
        this.selectedProfiles = data.profiles;
        this.selectedPolicies = data.policies;
      });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      type: ['', Validators.required],
      sourceAddress: ['', Validators.compose([IpAddressCidrValidator])],
      sourceAddressTranslation: [''],
      destinationAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      servicePort: ['', Validators.compose([Validators.required, Validators.min(1), Validators.max(65535)])],
      pool: ['', Validators.required],
      selectedIRule: [''],
      selectedProfile: [''],
      selectedPolicy: [''],
    });

    this.availableIRules = new Array<LoadBalancerIrule>();
    this.selectedIRules = new Array<LoadBalancerIrule>();
    this.availableProfiles = new Array<LoadBalancerProfile>();
    this.selectedProfiles = new Array<LoadBalancerProfile>();
    this.availablePolicies = new Array<LoadBalancerPolicy>();
    this.selectedPolicies = new Array<LoadBalancerPolicy>();
  }

  private unsubAll() {}

  public reset() {
    this.unsubAll();
    this.submitted = false;
    this.VirtualServerId = null;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }

  ngOnDestroy() {
    this.unsubAll();
  }
}
