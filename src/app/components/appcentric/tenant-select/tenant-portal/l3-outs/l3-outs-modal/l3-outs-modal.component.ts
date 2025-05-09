import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
  BridgeDomain,
  EndpointGroup,
  EndpointSecurityGroup,
  GetManyVrfResponseDto,
  L3Out,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
  V2AppCentricEndpointSecurityGroupsService,
  V2AppCentricL3outsService,
  V2AppCentricVrfsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { L3OutsModalDto } from 'src/app/models/appcentric/l3-outs-model-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { NameValidator } from 'src/app/validators/name-validator';

// Interfaces for subnet-to-EPG/ESG associations
interface SubnetAssociation {
  id: string;
  name: string;
  gateway: string;
  isAdvertised: boolean;
}

interface BridgeDomainWithSubnets {
  id: string;
  name: string;
  subnets: SubnetAssociation[];
  epgs: EndpointGroup[];
  esgs: EndpointSecurityGroup[];
}

@Component({
  selector: 'app-l3-outs-modal',
  templateUrl: './l3-outs-modal.component.html',
  styleUrls: ['./l3-outs-modal.component.css'],
})
export class L3OutsModalComponent implements OnInit {
  public modalMode: ModalMode;
  public l3OutId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() public tenantId: string;
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 5;
  public isLoading = false;
  @Input() public vrfs: GetManyVrfResponseDto;
  public create: boolean;
  public dto;
  public vrf;
  public modalModeEnum = ModalMode;

  public bridgeDomains: BridgeDomain[] = [];
  public epgs: EndpointGroup[] = [];
  public esgs: EndpointSecurityGroup[] = [];

  // New properties for subnet-to-EPG/ESG associations
  public bridgeDomainsWithSubnets: BridgeDomainWithSubnets[] = [];
  public selectedEpgIds: Set<string> = new Set();
  public selectedEsgIds: Set<string> = new Set();

  @ViewChild('vrfSelectTemplate') vrfSelectTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'l3out modal',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.vrfSelectTemplate },
    ],
  };

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private l3OutsService: V2AppCentricL3outsService,
    private vrfService: V2AppCentricVrfsService,
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
    private epgService: V2AppCentricEndpointGroupsService,
    private esgService: V2AppCentricEndpointSecurityGroupsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getVrfs(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('l3OutsModal');
    this.reset();
  }

  public getData(): void {
    this.dto = Object.assign({}, this.ngx.getModalData('l3OutsModal') as L3OutsModalDto);

    this.modalMode = this.dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.l3OutId = this.dto.l3Out.id;

      // Get the VRF first
      this.vrfService.getOneVrf({ id: this.dto.l3Out.vrfId }).subscribe(vrf => {
        this.vrf = vrf;
        // Only load bridge domains after VRF is loaded
        this.loadBridgeDomains();
      });
    } else {
      this.form.controls.name.enable();
    }

    if (this.dto.l3Out?.vrfId) {
      this.getVrf(this.dto.l3Out.vrfId);
    }

    const l3Outs = this.dto.l3Out;
    if (l3Outs !== undefined) {
      this.form.controls.name.setValue(l3Outs.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(l3Outs.description);
      this.form.controls.alias.setValue(l3Outs.alias);
      this.form.controls.vrfId.setValue(l3Outs.vrfId);
    }
    this.ngx.resetModalData('l3OutsModal');
  }

  // Load data in sequence
  private loadBridgeDomains(): void {
    if (!this.dto?.l3Out?.vrfId) {
      console.error('L3OutsModal - loadBridgeDomains - no VRF ID available');
      return;
    }

    this.bridgeDomainService
      .getManyBridgeDomain({
        filter: [`tenantId||eq||${this.tenantId}`, `vrfId||eq||${this.dto.l3Out.vrfId}`],
        relations: ['subnets'],
        page: 1,
        perPage: 100,
      })
      .subscribe(
        bridgeDomains => {
          this.bridgeDomains = bridgeDomains.data || [];
          this.processBridgeDomains();
          // After bridge domains are loaded, load EPGs
          this.loadEpgs();
        },
        error => {
          console.error('L3OutsModal - loadBridgeDomains - error:', error);
        },
      );
  }

  private loadEpgs(): void {
    if (!this.bridgeDomains || this.bridgeDomains.length === 0) {
      return;
    }

    const bridgeDomainIds = this.bridgeDomains.map(bd => bd.id).join(',');

    this.epgService
      .getManyEndpointGroup({
        filter: [`tenantId||eq||${this.tenantId}`, `bridgeDomainId||in||${bridgeDomainIds}`],
        page: 1,
        perPage: 100,
      })
      .subscribe(
        epgs => {
          this.epgs = epgs.data || [];
          this.updateEpgAssociations();
          // After EPGs are loaded, load ESGs
          this.loadEsgs();
        },
        error => {
          console.error('L3OutsModal - loadEpgs - error:', error);
        },
      );
  }

  private loadEsgs(): void {
    this.esgService
      .getManyEndpointSecurityGroup({
        filter: [`tenantId||eq||${this.tenantId}`],
        relations: ['selectors'],
        page: 1,
        perPage: 100,
      })
      .subscribe(
        esgs => {
          this.esgs = esgs.data || [];
          this.updateEsgAssociations();
        },
        error => {
          console.error('L3OutsModal - loadEsgs - error:', error);
        },
      );
  }

  // New methods for subnet-to-EPG/ESG associations
  private processBridgeDomains(): void {
    if (!this.bridgeDomains) {
      return;
    }

    this.bridgeDomainsWithSubnets = this.bridgeDomains.map(bd => {
      const subnets =
        bd.subnets?.map(subnet => ({
          id: subnet.id,
          name: subnet.name || 'Subnet ' + subnet.id,
          gateway: subnet.gatewayIp || 'No gateway',
          isAdvertised: subnet.advertisedExternally || false,
        })) || [];

      return {
        id: bd.id,
        name: bd.name,
        subnets,
        epgs: [],
        esgs: [],
      };
    });
  }

  private updateEpgAssociations(): void {
    if (!this.epgs || !this.bridgeDomainsWithSubnets) {
      return;
    }

    // Group EPGs by bridge domain
    this.bridgeDomainsWithSubnets.forEach(bd => {
      bd.epgs = this.epgs.filter(epg => epg.bridgeDomainId === bd.id);
    });
  }

  private updateEsgAssociations(): void {
    if (!this.esgs || !this.bridgeDomainsWithSubnets) {
      return;
    }

    // For ESGs, we need to check which ones are associated with the EPGs in each bridge domain
    this.bridgeDomainsWithSubnets.forEach(bd => {
      const epgIds = bd.epgs.map(epg => epg.id);
      bd.esgs = this.esgs.filter(esg =>
        esg.selectors?.some(selector => selector.endpointGroupId && epgIds.includes(selector.endpointGroupId)),
      );
    });
  }

  public toggleSubnetAdvertisement(bdId: string, subnetId: string): void {
    const bd = this.bridgeDomainsWithSubnets.find(b => b.id === bdId);
    if (bd) {
      const subnet = bd.subnets.find(s => s.id === subnetId);
      if (subnet) {
        subnet.isAdvertised = !subnet.isAdvertised;
      }
    }
  }

  public toggleEpgSelection(epgId: string): void {
    if (this.selectedEpgIds.has(epgId)) {
      this.selectedEpgIds.delete(epgId);
    } else {
      this.selectedEpgIds.add(epgId);
    }
  }

  public toggleEsgSelection(esgId: string): void {
    if (this.selectedEsgIds.has(esgId)) {
      this.selectedEsgIds.delete(esgId);
    } else {
      this.selectedEsgIds.add(esgId);
    }
  }

  public isEpgSelected(epgId: string): boolean {
    return this.selectedEpgIds.has(epgId);
  }

  public isEsgSelected(esgId: string): boolean {
    return this.selectedEsgIds.has(esgId);
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('l3OutsModal');
    this.buildForm();
    this.bridgeDomainsWithSubnets = [];
    this.selectedEpgIds.clear();
    this.selectedEsgIds.clear();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      vrfId: ['', Validators.required],
    });
  }

  private createL3Out(l3Out: L3Out): void {
    this.l3OutsService.createOneL3Out({ l3Out }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editL3Out(l3Out: L3Out): void {
    delete l3Out.name;
    delete l3Out.vrfId;
    delete l3Out.tenantId;
    this.l3OutsService
      .updateOneL3Out({
        id: this.l3OutId,
        l3Out,
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

    const { name, description, alias, vrfId } = this.form.value;
    const tenantId = this.tenantId;
    const l3Out = {
      name,
      description,
      alias,
      tenantId,
      vrfId,
    } as L3Out;

    if (this.modalMode === ModalMode.Create) {
      this.createL3Out(l3Out);
    } else {
      this.editL3Out(l3Out);
    }
  }

  public getVrfs(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 20;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
    }
    this.vrfService
      .getManyVrf({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.vrfs = data;
        },
        () => {
          this.vrfs = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public getVrf(vrfId): void {
    this.vrfService
      .getOneVrf({
        id: vrfId,
      })
      .subscribe(data => (this.vrf = data));
  }
}
