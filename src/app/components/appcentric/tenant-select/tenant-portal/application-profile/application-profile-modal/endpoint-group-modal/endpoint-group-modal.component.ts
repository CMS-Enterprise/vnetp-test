import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { V2AppCentricEndpointGroupsService, EndpointGroup, V2AppCentricBridgeDomainsService, BridgeDomain } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { ConsumedContractComponent } from './consumed-contract/consumed-contract.component';
import { ProvidedContractComponent } from './provided-contract/provided-contract.component';

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
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public perPage = 5;
  public isLoading = false;
  @Input() public applicationProfileId;
  public bridgeDomains: BridgeDomain[];
  public currentTab = 'Endpoint Group';
  public selectedBridgeDomain = undefined;

  @ViewChild('consumedContract', { static: false })
  consumedContractRef: ConsumedContractComponent;

  @ViewChild('providedContract', { static: false })
  providedContractRef: ProvidedContractComponent;

  public tabs: Tab[] = tabs.map(t => ({ name: t.name }));

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private router: Router,
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/tenant-select\/edit\/[0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{4}-[0-9A-Fa-f]{12}/);
        if (match) {
          const uuid = match[0].split('/')[2];
          this.tenantId = uuid;
        }
      }
    });
  }

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
    });
  }

  private createEndpointGroup(endpointGroup: EndpointGroup): void {
    this.endpointGroupService.createEndpointGroup({ endpointGroup }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editEndpointGroup(endpointGroup: EndpointGroup): void {
    endpointGroup.name = null;
    endpointGroup.tenantId = null;
    endpointGroup.applicationProfileId = null;
    this.endpointGroupService
      .updateEndpointGroup({
        uuid: this.endpointGroupId,
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

    const { name, description, alias, intraEpgIsolation, bridgeDomain } = this.form.value;
    const tenantId = this.tenantId;
    const applicationProfileId = this.applicationProfileId;
    const endpointGroup = {
      name,
      description,
      alias,
      tenantId,
      applicationProfileId,
      bridgeDomainId: bridgeDomain,
    } as EndpointGroup;

    endpointGroup.intraEpgIsolation = intraEpgIsolation === 'true';

    if (this.ModalMode === ModalMode.Create) {
      this.createEndpointGroup(endpointGroup);
    } else {
      this.editEndpointGroup(endpointGroup);
    }
  }

  public getBridgeDomains(): void {
    this.isLoading = true;
    this.bridgeDomainService
      .findAllBridgeDomain({
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
}
