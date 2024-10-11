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
  Selector,
  V2AppCentricEndpointGroupsService,
  EndpointGroup,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { ConsumedContractComponent } from '../../consumed-contract/consumed-contract.component';
import { ProvidedContractComponent } from '../../provided-contract/provided-contract.component';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { Subscription } from 'rxjs';
import { TableContextService } from 'src/app/services/table-context.service';
import { SelectorModalDto } from 'src/app/models/appcentric/appcentric-selector-modal-dto';
import { EntityService } from 'src/app/services/entity.service';

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
  public tableComponentDto = new TableComponentDto();
  endpointGroups: EndpointGroup[];
  tagSelectors = { data: [] };
  IpSubnetSelectors = { data: [] };
  epgSelectors = { data: [] };
  selectors;
  selectorModalSubscription: Subscription;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  @ViewChild('consumedContract', { static: false })
  consumedContractRef: ConsumedContractComponent;

  @ViewChild('providedContract', { static: false })
  providedContractRef: ProvidedContractComponent;

  public tabs: Tab[] = tabs.map(t => ({ name: t.name }));

  public searchColumns: SearchColumnConfig[] = [];

  public tagSelectorConfig: TableConfig<any> = {
    description: 'Tag Selectors',
    columns: [
      { name: 'Tag Key', property: 'tagKey' },
      { name: 'Value Operator', property: 'valueOperator' },
      { name: 'Tag Value', property: 'tagValue' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public epgSelectorConfig: TableConfig<any> = {
    description: 'EPG Selectors',
    columns: [
      { name: 'EPG', property: 'endpointSecurityGroupId' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };
  public IpSubnetSelectorConfig: TableConfig<any> = {
    description: 'IpSubnet Selectors',
    columns: [
      { name: 'ipSubnet', property: 'IpSubnet' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private tableContextService: TableContextService,
    private endpointSecurityGroupService: V2AppCentricEndpointSecurityGroupsService,
    private vrfService: V2AppCentricVrfsService,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
    private entityService: EntityService,
    private selectorService: V2AppCentricSelectorsService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
  ) {}

  ngOnInit(): void {
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

  public openSelectorModal(modalMode, selector?: Selector): void {
    this.IpSubnetSelectors.data = [];
    this.epgSelectors.data = [];
    this.tagSelectors.data = [];
    const dto = new SelectorModalDto();

    dto.modalMode = modalMode;
    dto.selector = selector;

    this.subscribeToSelectorModal();
    this.ngx.setModalData(dto, 'selectorModal');
    this.ngx.getModal('selectorModal').open();
  }

  private subscribeToSelectorModal(): void {
    this.selectorModalSubscription = this.ngx.getModal('selectorModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('selectorModal');
      this.selectorModalSubscription.unsubscribe();

      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getEndpointSecurityGroup(this.endpointSecurityGroupId);
      } else {
        this.getEndpointSecurityGroup(this.endpointSecurityGroupId);
      }
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
    this.ngx.close('endpointSecurityGroupModal');
    this.reset();
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
    delete endpointSecurityGroup.vrfId;
    delete endpointSecurityGroup.adminState;
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

  public deleteSelector(selector): void {
    this.entityService.deleteEntity(selector, {
      entityName: 'Selector',
      delete$: this.selectorService.deleteOneSelector({ id: selector.id }),
      softDelete$: this.selectorService.softDeleteOneSelector({ id: selector.id }),
      onSuccess: () => {
        this.getEndpointSecurityGroup(this.endpointSecurityGroupId);
      },
    });
  }
}
