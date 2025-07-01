import { Component, OnInit, Input, ViewChild, TemplateRef } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import {
  ApplicationProfile,
  V2AppCentricEndpointSecurityGroupsService,
  V2AppCentricApplicationProfilesService,
  EndpointSecurityGroup,
  V2AppCentricVrfsService,
  Vrf,
  V2AppCentricSelectorsService,
  V2AppCentricEndpointGroupsService,
  EndpointGroup,
  Selector,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { Subscription } from 'rxjs';
import { SelectorModalDto } from 'src/app/models/appcentric/appcentric-selector-modal-dto';
import { EntityService } from 'src/app/services/entity.service';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import { ContractAssociationComponent } from '../../contract-association/contract-association.component';

const tabs = [
  { name: 'Endpoint Security Group' },
  { name: 'Consumed Contracts' },
  { name: 'Provided Contracts' },
  { name: 'Intra-ESG Contracts' },
];

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
  public currentTab = 'Endpoint Security Group';
  public selectedBridgeDomain = undefined;
  public applicationProfiles: ApplicationProfile[];
  public tableComponentDto = new TableComponentDto();
  endpointGroups: EndpointGroup[];
  tagSelectors = { data: [] };
  IpSubnetSelectors = { data: [] };
  epgSelectors = { data: [] };
  selectorModalSubscription: Subscription;
  esgVrfId: string;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  @ViewChild('consumedContract', { static: false })
  consumedContractRef: ContractAssociationComponent;

  @ViewChild('providedContract', { static: false })
  providedContractRef: ContractAssociationComponent;

  @ViewChild('intraContract', { static: false })
  intraContractRef: ContractAssociationComponent;

  public tabs: Tab[] = tabs.map(t => ({ name: t.name }));

  public searchColumns: SearchColumnConfig[] = [];

  public tagSelectorConfig: TableConfig<any> = {
    description: 'Tag Selectors',
    columns: [
      { name: 'Tag Key', property: 'tagKey' },
      { name: 'Value Operator', property: 'valueOperator' },
      { name: 'Tag Value', property: 'tagValue' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public epgSelectorConfig: TableConfig<any> = {
    description: 'EPG Selectors',
    columns: [
      { name: 'EPG', property: 'endpointGroupName' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public IpSubnetSelectorConfig: TableConfig<any> = {
    description: 'IpSubnet Selectors',
    columns: [
      { name: 'IpSubnet', property: 'IpSubnet' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    public formBuilder: UntypedFormBuilder,
    public ngx: NgxSmartModalService,
    public endpointSecurityGroupService: V2AppCentricEndpointSecurityGroupsService,
    public vrfService: V2AppCentricVrfsService,
    public applicationProfileService: V2AppCentricApplicationProfilesService,
    public entityService: EntityService,
    public selectorService: V2AppCentricSelectorsService,
    public endpointGroupService: V2AppCentricEndpointGroupsService,
  ) {}

  ngOnInit(): void {
    this.getEndpointGroups();
    this.buildForm();
  }

  getEndpointSecurityGroup(id: string): void {
    this.tagSelectors.data = [];
    this.IpSubnetSelectors.data = [];
    this.epgSelectors.data = [];
    this.endpointSecurityGroupService
      .getOneEndpointSecurityGroup({
        id,
        join: ['selectors'],
      })
      .subscribe(data => {
        data.selectors.map(selector => {
          if (selector.selectorType === 'Tag') {
            this.tagSelectors.data.push(selector);
          } else if (selector.selectorType === 'EPG') {
            this.epgSelectors.data.push(selector);
          } else {
            this.IpSubnetSelectors.data.push(selector);
          }
        });
        return data;
      });
  }

  public openSelectorModal(): void {
    const selector = {} as any;
    selector.existingEpgSelectors = this.epgSelectors.data;
    this.IpSubnetSelectors.data = [];
    this.epgSelectors.data = [];
    this.tagSelectors.data = [];
    const dto = new SelectorModalDto();
    dto.selector = selector;

    this.subscribeToSelectorModal();
    this.ngx.setModalData(dto, 'selectorModal');
    this.ngx.getModal('selectorModal').open();
  }

  public subscribeToSelectorModal(): void {
    this.selectorModalSubscription = this.ngx.getModal('selectorModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('selectorModal');
      this.selectorModalSubscription.unsubscribe();
      this.getEndpointSecurityGroup(this.endpointSecurityGroupId);
    });
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getApplicationProfiles();
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
    this.reset();
    this.ngx.close('endpointSecurityGroupModal');
  }

  public getData(): void {
    this.getVrfs();
    this.getApplicationProfiles();

    const dto = Object.assign({}, this.ngx.getModalData('endpointSecurityGroupModal') as any);
    this.ModalMode = dto.modalMode;

    if (this.ModalMode === ModalMode.Edit) {
      this.endpointSecurityGroupId = dto.endpointSecurityGroup.id;

      dto.selectors.map(selector => {
        if (selector.selectorType === 'Tag') {
          this.tagSelectors.data.push(selector);
        } else if (selector.selectorType === 'EPG') {
          this.epgSelectors.data.push(selector);
        } else {
          this.IpSubnetSelectors.data.push(selector);
        }
      });
    } else {
      this.form.controls.name.enable();
      this.form.controls.intraEsgIsolation.setValue(true);
      this.form.controls.adminState.setValue('AdminUp');
      this.form.controls.preferredGroupMember.setValue(true);
    }

    const endpointSecurityGroup = dto.endpointSecurityGroup;
    if (endpointSecurityGroup !== undefined) {
      this.esgVrfId = endpointSecurityGroup.vrfId;
      this.form.controls.name.setValue(endpointSecurityGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(endpointSecurityGroup.description);
      this.form.controls.preferredGroupMember.setValue(endpointSecurityGroup.preferredGroupMember);
      this.form.controls.adminState.setValue(endpointSecurityGroup.adminState);
      this.form.controls.preferredGroupMember.setValue(endpointSecurityGroup.preferredGroupMember);
      this.form.controls.intraEsgIsolation.setValue(endpointSecurityGroup.intraEsgIsolation);
      this.form.controls.applicationProfileId.setValue(endpointSecurityGroup.applicationProfileId);
      this.form.controls.applicationProfileId.disable();
      this.form.controls.vrfId.setValue(endpointSecurityGroup.vrfId);
      this.form.controls.vrfId.disable();
    }
  }

  public reset(): void {
    this.submitted = false;
    this.IpSubnetSelectors.data = [];
    this.epgSelectors.data = [];
    this.tagSelectors.data = [];
    this.ngx.resetModalData('endpointSecurityGroupModal');
    this.buildForm();
    // this.providedContractRef.clearSelectedContract();
    // this.consumedContractRef.clearSelectedContract();
    // this.currentTab = this.tabs[0].name;
    if (this.currentTab === 'Provided Contracts') {
      this.providedContractRef.clearSelectedContract();
    }

    if (this.currentTab === 'Consumed Contracts') {
      this.consumedContractRef.clearSelectedContract();
    }
    this.currentTab = this.tabs[0].name;
  }

  public buildForm(): void {
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

  public createEndpointSecurityGroup(endpointSecurityGroup: EndpointSecurityGroup): void {
    this.endpointSecurityGroupService.createOneEndpointSecurityGroup({ endpointSecurityGroup }).subscribe({
      next: () => {
        this.closeModal();
      },
    });
  }

  public editEndpointSecurityGroup(endpointSecurityGroup: EndpointSecurityGroup): void {
    delete endpointSecurityGroup.name;
    delete endpointSecurityGroup.tenantId;
    delete endpointSecurityGroup.applicationProfileId;
    delete endpointSecurityGroup.vrfId;
    this.endpointSecurityGroupService
      .updateOneEndpointSecurityGroup({
        id: this.endpointSecurityGroupId,
        endpointSecurityGroup,
      })
      .subscribe({
        next: () => {
          this.closeModal();
        },
      });
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
        filter: [`tenantId||eq||${this.tenantId}`, 'deletedAt||isnull'],
        page: 1,
        perPage: 1000,
      })
      .subscribe({
        next: data => {
          this.vrfs = data.data;
        },
        error: () => {
          this.vrfs = null;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  public getInitialTabIndex(): number {
    return this.tabs.findIndex(t => t.name === this.currentTab);
  }

  public getApplicationProfiles(): void {
    this.isLoading = true;
    this.applicationProfileService
      .getManyApplicationProfile({
        filter: [`tenantId||eq||${this.tenantId}`, 'deletedAt||isnull'],
      })
      .subscribe({
        next: data => {
          this.applicationProfiles = data as any;
        },
        error: () => {
          this.applicationProfiles = null;
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        },
      });
  }

  public softDeleteSelector(selector: Selector): void {
    this.selectorService
      .softDeleteOneSelector({ id: selector.id })
      .subscribe(() => this.getEndpointSecurityGroup(this.endpointSecurityGroupId));
  }

  public hardDeleteSelector(selector: Selector): void {
    this.selectorService.deleteOneSelector({ id: selector.id }).subscribe(() => {
      this.getEndpointSecurityGroup(this.endpointSecurityGroupId);
    });
  }

  public restoreSelector(selector: Selector): void {
    this.selectorService
      .restoreOneSelector({ id: selector.id })
      .subscribe(() => this.getEndpointSecurityGroup(this.endpointSecurityGroupId));
  }

  public getEndpointGroups(): void {
    this.endpointGroupService
      .getManyEndpointGroup({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(data => {
        this.endpointGroups = data.data;
      });
  }

  public retrieveAndUpdateEndpointGroup(epgId: string): void {
    this.endpointGroupService.getOneEndpointGroup({ id: epgId }).subscribe(epg => {
      delete epg.name;
      delete epg.tenantId;
      delete epg.applicationProfileId;
      return this.endpointGroupService.updateOneEndpointGroup({ id: epg.id, endpointGroup: epg }).subscribe();
    });
  }

  public importSelectors(event): void {
    const modalDto = new YesNoModalDto(
      'Import Selectors',
      `Are you sure you would like to import ${event.length} Selector${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeSelectorData(event);
      this.selectorService.bulkUploadSelectors({ requestBody: dto }).subscribe({
        complete: () => {
          this.getEndpointSecurityGroup(this.endpointSecurityGroupId);
        },
      });
    };
    const onClose = () => {
      this.getEndpointSecurityGroup(this.endpointSecurityGroupId);
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  sanitizeSelectorData(entities: any) {
    return entities.map(entity => {
      this.mapSelectorToCsv(entity);
      return entity;
    });
  }

  mapSelectorToCsv = obj => {
    Object.entries(obj).forEach(([key, val]) => {
      if (val === 'false' || val === 'f') {
        obj[key] = false;
      }
      if (val === 'true' || val === 't') {
        obj[key] = true;
      }
      if (val === null || val === '') {
        delete obj[key];
      }
      if (key === 'EPGName') {
        if (val !== '') {
          obj.endpointGroupName = val;
        }
        const epgId = ObjectUtil.getObjectId(val as string, this.endpointGroups);
        if (epgId !== val) {
          obj.endpointGroupId = epgId;
          delete obj[key];
        } else {
          obj.endpointGroupId = val;
          delete obj[key];
        }
      }
      if (key === 'endpointSecurityGroupName') {
        obj[key] = this.endpointSecurityGroupId;
        obj.endpointSecurityGroupId = obj[key];
        delete obj[key];
      }
      if (key === 'vrfName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.vrfs);
        obj.vrfId = obj[key];
        delete obj[key];
      }
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
    });
    return obj;
  };
}
