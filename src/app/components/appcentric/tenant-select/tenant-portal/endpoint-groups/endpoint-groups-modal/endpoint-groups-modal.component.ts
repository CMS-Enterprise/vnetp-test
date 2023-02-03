import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import {
  V2AppCentricEndpointGroupsService,
  EndpointGroup,
  ApplicationProfile,
  V2AppCentricApplicationProfilesService,
  ApplicationProfilePaginationResponse,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { Tab } from 'src/app/common/tabs/tabs.component';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';

const tabs = [{ name: 'Endpoint Group' }, { name: 'Consumed Contracts' }, { name: 'Provided Contracts' }];

@Component({
  selector: 'app-endpoint-groups-modal',
  templateUrl: './endpoint-groups-modal.component.html',
  styleUrls: ['./endpoint-groups-modal.component.css'],
})
export class EndpointGroupsModalComponent implements OnInit {
  public initialTabIndex = 'Endpoint Group';

  public ModalMode: ModalMode;
  public endpointGroupId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 5;
  public isLoading = false;
  public applicationProfiles = {} as ApplicationProfilePaginationResponse;

  @ViewChild('applicationProfileSelectTemplate') applicationProfileSelectTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'Application Profiles',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.applicationProfileSelectTemplate },
    ],
  };

  public tabs: Tab[] = tabs.map(t => {
    return { name: t.name };
  });

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private router: Router,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) {
          this.tenantId = match[1];
        }
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
    this.getApplicationProfiles();
  }

  public handleTabChange(tab: Tab): void {
    if (tab) {
      this.initialTabIndex = tab.name;
    }
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getApplicationProfiles(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('endpointGroupModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('endpointGroupModal') as EndpointGroupModalDto);

    this.ModalMode = dto.modalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.endpointGroupId = dto.endpointGroup.id;
    } else {
      this.form.controls.name.enable();
    }

    const endpointGroup = dto.endpointGroup;
    if (endpointGroup !== undefined) {
      this.form.controls.name.setValue(endpointGroup.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(endpointGroup.description);
      this.form.controls.alias.setValue(endpointGroup.alias);
      this.form.controls.policyControlEnforced.setValue(endpointGroup.intraEpgIsolation);
      this.form.controls.applicationProfileId.setValue(endpointGroup.applicationProfileId);
    }
    this.ngx.resetModalData('endpointGroupModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('endpointGroupModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      alias: [null],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      intraEpgIsolation: ['', Validators.required],
      applicationProfileId: ['', Validators.required],
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

    const { name, description, alias, intraEpgIsolation, applicationProfileId } = this.form.value;
    const tenantId = this.tenantId;
    const endpointGroup = {
      name,
      description,
      alias,
      tenantId,
      applicationProfileId,
    } as EndpointGroup;

    endpointGroup.intraEpgIsolation = intraEpgIsolation === 'true';

    if (this.ModalMode === ModalMode.Create) {
      this.createEndpointGroup(endpointGroup);
    } else {
      this.editEndpointGroup(endpointGroup);
    }
  }

  public getApplicationProfiles(event?): void {
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
    this.applicationProfileService
      .findAllApplicationProfile({
        filter: [`tenantId||eq||${this.tenantId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.applicationProfiles = data;
        },
        () => {
          this.applicationProfiles = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public addApplicationProfile(applicationProfile: ApplicationProfile) {}
}
