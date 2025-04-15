import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  BridgeDomain,
  V2AppCentricEndpointGroupsService,
  V2AppCentricBridgeDomainsService,
  EndpointGroup,
  ApplicationProfile,
  V2AppCentricApplicationProfilesService,
} from '../../../../../../../../client';
import { Tab } from '../../../../../../common/tabs/tabs.component';
import { EndpointGroupModalDto } from '../../../../../../models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from '../../../../../../models/other/modal-mode';
import { NameValidator } from '../../../../../../validators/name-validator';
import { ConsumedContractComponent } from '../../consumed-contract/consumed-contract.component';
import { ProvidedContractComponent } from '../../provided-contract/provided-contract.component';

const tabs = [{ name: 'Endpoint Group' }, { name: 'Consumed Contracts' }, { name: 'Provided Contracts' }];

@Component({
  selector: 'app-endpoint-group-modal',
  templateUrl: './endpoint-group-modal.component.html',
  styleUrls: ['./endpoint-group-modal.component.css'],
})
export class EndpointGroupModalComponent implements OnInit {
  public initialTabIndex = 0;

  public ModalMode: ModalMode;
  public endpointGroupId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() tenantId;
  public perPage = 5;
  public isLoading = false;
  public bridgeDomains: BridgeDomain[];
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
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
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
    this.ngx.close('endpointGroupModal');
    this.reset();
  }

  public getData(): void {
    this.getBridgeDomains();
    this.getApplicationProfiles();
    const dto = Object.assign({}, this.ngx.getModalData('endpointGroupModal') as EndpointGroupModalDto);
    this.ModalMode = dto.modalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.endpointGroupId = dto.endpointGroup.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.intraEpgIsolation.setValue('false');
      this.currentTab = 'Endpoint Group';
    }

    const endpointGroup = dto.endpointGroup;
    if (endpointGroup !== undefined) {
      this.form.controls.name.setValue(endpointGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(endpointGroup.description);
      this.form.controls.alias.setValue(endpointGroup.alias);
      this.form.controls.intraEpgIsolation.setValue(endpointGroup.intraEpgIsolation);
      this.form.controls.bridgeDomain.setValue(endpointGroup.bridgeDomainId);
      this.form.controls.applicationProfileId.setValue(endpointGroup.applicationProfileId);
      this.form.controls.applicationProfileId.disable();
      this.form.controls.bridgeDomain.disable();
    }
    this.ngx.resetModalData('endpointGroupModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('endpointGroupModal');
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
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      intraEpgIsolation: [null],
      bridgeDomain: ['', Validators.required],
      applicationProfileId: ['', [Validators.required]],
    });
  }

  private createEndpointGroup(endpointGroup: EndpointGroup): void {
    this.endpointGroupService.createOneEndpointGroup({ endpointGroup }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editEndpointGroup(endpointGroup: EndpointGroup): void {
    delete endpointGroup.name;
    delete endpointGroup.tenantId;
    delete endpointGroup.applicationProfileId;
    this.endpointGroupService
      .updateOneEndpointGroup({
        id: this.endpointGroupId,
        endpointGroup,
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

    const { name, description, alias, intraEpgIsolation, bridgeDomain, applicationProfileId } = this.form.value;
    const tenantId = this.tenantId;
    const endpointGroup = {
      name,
      description,
      alias,
      tenantId,
      intraEpgIsolation,
      applicationProfileId,
      bridgeDomainId: bridgeDomain,
    } as EndpointGroup;

    if (this.ModalMode === ModalMode.Create) {
      this.createEndpointGroup(endpointGroup);
    } else {
      this.editEndpointGroup(endpointGroup);
    }
  }

  public getBridgeDomains(): void {
    this.isLoading = true;
    this.bridgeDomainService
      .getManyBridgeDomain({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.bridgeDomains = data.data;
        },
        () => {
          this.bridgeDomains = null;
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
