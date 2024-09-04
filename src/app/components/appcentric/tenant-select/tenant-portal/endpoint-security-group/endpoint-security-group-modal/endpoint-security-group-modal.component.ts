import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  ApplicationProfile,
  V2AppCentricEndpointSecurityGroupsService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricApplicationProfilesService,
  EndpointSecurityGroup,
  V2AppCentricVrfsService,
  Vrf,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { ConsumedContractComponent } from '../../endpoint-group/endpoint-group-modal/consumed-contract/consumed-contract.component';
import { ProvidedContractComponent } from '../../endpoint-group/endpoint-group-modal/provided-contract/provided-contract.component';
import { EndpointSecurityGroupModalDto } from 'src/app/models/appcentric/endpoint-security-group-dto';

const tabs = [{ name: 'Endpoint Group' }, { name: 'Consumed Contracts' }, { name: 'Provided Contracts' }];

@Component({
  selector: 'app-endpoint-security-group-modal',
  templateUrl: './endpoint-security-group-modal.component.html',
  styleUrls: ['./endpoint-security-group-modal.component.css'],
})
export class EndpointSecurityGroupModalComponent implements OnInit {
  public initialTabIndex = 0;

  public ModalMode: ModalMode;
  public endpointSecurityGroupId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() tenantId;
  public perPage = 5;
  public isLoading = false;
  public vrfs: Vrf[];
  public currentTab = 'Endpoint Group';
  public selectedBridgeDomain = undefined;
  public applicationProfiles: ApplicationProfile[];

  @ViewChild('consumedContract', { static: false })
  consumedContractRef: ConsumedContractComponent;

  @ViewChild('providedContract', { static: false })
  providedContractRef: ProvidedContractComponent;

  public tabs: Tab[] = tabs.map(t => ({ name: t.name }));

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private endpointSecurityGroupService: V2AppCentricEndpointSecurityGroupsService,
    private vrfService: V2AppCentricVrfsService,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public handleTabChange(tab: Tab): void {
    if (tab) {
      this.currentTab = tab.name;
      this.initialTabIndex = this.getInitialTabIndex();
    }
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('endpointSecurityGroupModal');
    this.reset();
  }

  public getData(): void {
    this.getVrfs();
    this.getApplicationProfiles();
    const dto = Object.assign({}, this.ngx.getModalData('endpointSecurityGroupModal') as EndpointSecurityGroupModalDto);
    this.ModalMode = dto.modalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.endpointSecurityGroupId = dto.endpointSecurityGroup.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.intraEsgIsolation.setValue(true);
      this.form.controls.adminState.setValue('AdminUp');
      this.form.controls.preferredGroupMember.setValue(true);
      this.currentTab = 'Endpoint Security Group';
    }

    const endpointSecurityGroup = dto.endpointSecurityGroup;
    if (endpointSecurityGroup !== undefined) {
      this.form.controls.name.setValue(endpointSecurityGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(endpointSecurityGroup.description);
      this.form.controls.intraEsgIsolation.setValue(endpointSecurityGroup.intraEsgIsolation);
      this.form.controls.applicationProfileId.setValue(endpointSecurityGroup.applicationProfileId);
      this.form.controls.applicationProfileId.disable();
      this.form.controls.vrfId.setValue(endpointSecurityGroup.vrfId);
      this.form.controls.vrfId.disable();
    }
    this.ngx.resetModalData('endpointSecurityGroupModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('endpointSecurityGroupModal');
    this.buildForm();

    if (this.currentTab === 'Provided Contracts') {
      this.providedContractRef.clearSelectedContract();
    }

    if (this.currentTab === 'Consumed Contracts') {
      this.consumedContractRef.clearSelectedContract();
    }
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      adminState: ['', Validators.required],
      preferredGroupMember: ['', Validators.required],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      intraEsgIsolation: [null],
      vrfId: [null, Validators.required],
      applicationProfileId: ['', [Validators.required]],
    });
  }

  private createEndpointSecurityGroup(endpointSecurityGroup: EndpointSecurityGroup): void {
    this.endpointSecurityGroupService.createOneEndpointSecurityGroup({ endpointSecurityGroup }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editEndpointSecurityGroup(endpointSecurityGroup: EndpointSecurityGroup): void {
    delete endpointSecurityGroup.name;
    delete endpointSecurityGroup.tenantId;
    delete endpointSecurityGroup.applicationProfileId;
    this.endpointSecurityGroupService
      .updateOneEndpointSecurityGroup({
        id: this.endpointSecurityGroupId,
        endpointSecurityGroup,
      })
      .subscribe(
        () => {
          this.closeModal();
        },
        () => {},
      );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, preferredGroupMember, adminState, description, intraEsgIsolation, vrfId, applicationProfileId } = this.form.value;
    const tenantId = this.tenantId;
    const endpointSecurityGroup = {
      name,
      adminState,
      preferredGroupMember,
      description,
      tenantId,
      intraEsgIsolation,
      applicationProfileId,
      vrfId,
    } as any;

    if (this.ModalMode === ModalMode.Create) {
      this.createEndpointSecurityGroup(endpointSecurityGroup);
    } else {
      this.editEndpointSecurityGroup(endpointSecurityGroup);
    }
  }

  public getVrfs(): void {
    this.isLoading = true;
    this.vrfService
      .getManyVrf({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.vrfs = data.data;
        },
        () => {
          this.vrfs = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  private getInitialTabIndex(): number {
    return this.tabs.findIndex(t => t.name === this.currentTab);
  }

  public getApplicationProfiles(): void {
    this.isLoading = true;
    this.applicationProfileService
      .getManyApplicationProfile({
        filter: [`tenantId||eq||${this.tenantId}`],
      })
      .subscribe(
        data => {
          this.applicationProfiles = data as any;
        },
        () => {
          this.applicationProfiles = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }
}
