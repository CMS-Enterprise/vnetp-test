import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { VirtualServerModalHelpText } from 'src/app/helptext/help-text-networking';
import {
  LoadBalancerIrule,
  LoadBalancerPolicy,
  LoadBalancerPool,
  LoadBalancerProfile,
  LoadBalancerVirtualServer,
  Tier,
  V1LoadBalancerIrulesService,
  V1LoadBalancerPoliciesService,
  V1LoadBalancerPoolsService,
  V1LoadBalancerProfilesService,
  V1LoadBalancerVirtualServersService,
  V1TiersService,
} from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { VirtualServerModalDto } from './virtual-server-modal.dto';
import { IpAddressAnyValidator, IpAddressCidrValidator } from 'src/app/validators/network-form-validators';
import { RangeValidator } from 'src/app/validators/range-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';

@Component({
  selector: 'app-virtual-server-modal',
  templateUrl: './virtual-server-modal.component.html',
})
export class VirtualServerModalComponent implements OnInit {
  public form: UntypedFormGroup;
  public modalMode: ModalMode;
  public pools: LoadBalancerPool[] = [];
  public submitted: boolean;
  public ModalMode = ModalMode;

  public availableIRules;
  public availableProfiles;
  public availablePolicies;

  public selectedIRules: LoadBalancerIrule[] = [];
  public selectedProfiles: LoadBalancerProfile[] = [];
  public selectedPolicies: LoadBalancerPolicy[] = [];

  private virtualServerId: string;
  private tierId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: UntypedFormBuilder,
    private tiersService: V1TiersService,
    private poolsService: V1LoadBalancerPoolsService,
    private virtualServerService: V1LoadBalancerVirtualServersService,
    public helpText: VirtualServerModalHelpText,
    private profilesService: V1LoadBalancerProfilesService,
    private policiesService: V1LoadBalancerPoliciesService,
    private iRulesService: V1LoadBalancerIrulesService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  private loadProfiles(): void {
    this.profilesService
      .getManyLoadBalancerProfile({ filter: [`tierId||eq||${this.tierId}`, 'deletedAt||isnull'], perPage: 10000, page: 1 })
      .subscribe(response => {
        this.availableProfiles = response.data;
      });
  }

  private loadPolicies(): void {
    this.policiesService
      .getManyLoadBalancerPolicy({ filter: [`tierId||eq||${this.tierId}`, 'deletedAt||isnull'], perPage: 10000, page: 1 })
      .subscribe(response => {
        this.availablePolicies = response.data;
      });
  }

  private loadIRules(): void {
    this.iRulesService
      .getManyLoadBalancerIrule({ filter: [`tierId||eq||${this.tierId}`, 'deletedAt||isnull'], perPage: 10000, page: 1 })
      .subscribe(response => {
        this.availableIRules = response.data;
      });
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('virtualServerModal');
    this.submitted = false;
    this.virtualServerId = null;
    this.modalMode = null;
    this.buildForm();
  }

  public addIRule(): void {
    this.virtualServerService
      .addIRuleToVirtualServerLoadBalancerVirtualServer({
        virtualServerId: this.virtualServerId,
        iruleId: this.f.selectedIRuleId.value,
      })
      .subscribe(() => {
        this.loadSelectedResources();
        this.f.selectedIRuleId.setValue(null);
      });
  }

  public removeIRule(irule: LoadBalancerIrule): void {
    const modalDto = new YesNoModalDto('Remove iRule from Virtual Server', '', 'Remove iRule', 'Cancel', 'danger');
    const onConfirm = () => {
      this.virtualServerService
        .removeIRuleFromVirtualServerLoadBalancerVirtualServer({
          virtualServerId: this.virtualServerId,
          iruleId: irule.id,
        })
        .subscribe(() => {
          this.loadSelectedResources();
        });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public addProfile(): void {
    this.virtualServerService
      .addProfileToVirtualServerLoadBalancerVirtualServer({
        virtualServerId: this.virtualServerId,
        profileId: this.f.selectedProfileId.value,
      })
      .subscribe(() => {
        this.loadSelectedResources();
        this.f.selectedProfileId.setValue(null);
      });
  }

  public removeProfile(profile: LoadBalancerProfile): void {
    const modalDto = new YesNoModalDto('Remove Profile from Virtual Server', '', 'Remove Profile', 'Cancel', 'danger');
    const onConfirm = () => {
      this.virtualServerService
        .removeProfileFromVirtualServerLoadBalancerVirtualServer({
          virtualServerId: this.virtualServerId,
          profileId: profile.id,
        })
        .subscribe(() => {
          this.loadSelectedResources();
        });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public addPolicy(): void {
    this.virtualServerService
      .addPolicyToVirtualServerLoadBalancerVirtualServer({
        virtualServerId: this.virtualServerId,
        policyId: this.f.selectedPolicyId.value,
      })
      .subscribe(() => {
        this.loadSelectedResources();
        this.f.selectedPolicyId.setValue(null);
      });
  }

  public removePolicy(policy: LoadBalancerPolicy): void {
    const modalDto = new YesNoModalDto('Remove Policy from Virtual Server', '', 'Remove Policy', 'Cancel', 'danger');
    const onConfirm = () => {
      this.virtualServerService
        .removePolicyFromVirtualServerLoadBalancerVirtualServer({
          virtualServerId: this.virtualServerId,
          policyId: policy.id,
        })
        .subscribe(() => {
          this.loadSelectedResources();
        });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { defaultPoolId, description, destinationIpAddress, name, servicePort, sourceAddressTranslation, sourceIpAddress, type } =
      this.form.value;

    const virtualServer: LoadBalancerVirtualServer = {
      tierId: this.tierId,
      defaultPoolId,
      description,
      destinationIpAddress,
      name,
      servicePort,
      sourceAddressTranslation,
      sourceIpAddress,
      type,
    };

    if (this.modalMode === ModalMode.Create) {
      this.createVirtualServer(virtualServer);
    } else {
      this.updateVirtualServer(virtualServer);
    }
  }

  public getData(): void {
    const dto: VirtualServerModalDto = Object.assign({}, this.ngx.getModalData('virtualServerModal')) as any;
    const { virtualServer, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = virtualServer ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { name, destinationIpAddress, defaultPoolId, servicePort, sourceIpAddress, sourceAddressTranslation, type, id } = virtualServer;
      this.virtualServerId = id;

      this.form.controls.name.disable();
      this.form.controls.type.disable();

      this.form.controls.name.setValue(name);
      this.form.controls.destinationIpAddress.setValue(destinationIpAddress);
      this.form.controls.defaultPoolId.setValue(defaultPoolId);
      this.form.controls.servicePort.setValue(servicePort);
      this.form.controls.sourceIpAddress.setValue(sourceIpAddress);
      this.form.controls.sourceAddressTranslation.setValue(sourceAddressTranslation);
      this.form.controls.type.setValue(type);

      // this.loadAvailableResources();
      this.loadSelectedResources();
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    this.loadPools();
    this.loadProfiles();
    this.loadPolicies();
    this.loadIRules();
    this.ngx.resetModalData('virtualServerModal');
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      defaultPoolId: [null],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      destinationIpAddress: ['', Validators.compose([Validators.required, IpAddressAnyValidator])],
      name: ['', NameValidator()],
      selectedIRuleId: [null],
      selectedPolicyId: [null],
      selectedProfileId: [null],
      servicePort: ['', Validators.compose([Validators.required, RangeValidator(1, 65535)])],
      sourceAddressTranslation: ['', Validators.required],
      sourceIpAddress: ['', Validators.compose([Validators.required, IpAddressCidrValidator])],
      type: ['', Validators.required],
    });

    this.availableIRules = [];
    this.availableProfiles = [];
    this.availablePolicies = [];

    this.selectedIRules = [];
    this.selectedProfiles = [];
    this.selectedPolicies = [];
  }

  private loadPools(): void {
    this.poolsService
      .getPoolsLoadBalancerPool({
        id: this.tierId,

        // review this approach, we either need to take action here or at the API level
        // to determine how to retrieve these objects. i have commented out the action at the API level.
        // there is only 2 instances of this scenario
        limit: 10000,
        page: 1,
      })
      .subscribe(pools => {
        this.pools = pools.data;
        this.pools = this.pools.filter(pool => pool.deletedAt === null);
      });
  }

  private loadAvailableResources(): void {
    this.tiersService
      .getOneTier({
        id: this.tierId,
        join: ['loadBalancerIrules,loadBalancerProfiles,loadBalancerPolicies'],
      })
      .subscribe((tier: Tier) => {
        this.availableIRules = tier.loadBalancerIrules;
        this.availableProfiles = tier.loadBalancerProfiles;
        this.availablePolicies = tier.loadBalancerPolicies;
      });
  }

  private loadSelectedResources(): void {
    this.virtualServerService
      .getOneLoadBalancerVirtualServer({
        id: this.virtualServerId,
        join: ['irules,profiles,policies'],
      })
      .subscribe((virtualServer: LoadBalancerVirtualServer) => {
        this.selectedIRules = virtualServer.irules;
        this.selectedProfiles = virtualServer.profiles;
        this.selectedPolicies = virtualServer.policies;
      });
  }

  private createVirtualServer(loadBalancerVirtualServer: LoadBalancerVirtualServer): void {
    this.virtualServerService.createOneLoadBalancerVirtualServer({ loadBalancerVirtualServer }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateVirtualServer(loadBalancerVirtualServer: LoadBalancerVirtualServer): void {
    delete loadBalancerVirtualServer.tierId;
    this.virtualServerService
      .updateOneLoadBalancerVirtualServer({
        id: this.virtualServerId,
        loadBalancerVirtualServer,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }
}
