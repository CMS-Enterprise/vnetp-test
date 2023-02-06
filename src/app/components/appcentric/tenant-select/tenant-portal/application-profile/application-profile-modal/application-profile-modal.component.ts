import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import {
  ApplicationProfile,
  EndpointGroup,
  EndpointGroupPaginationResponse,
  V2AppCentricApplicationProfilesService,
  V2AppCentricEndpointGroupsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ApplicationProfileModalDto } from 'src/app/models/appcentric/application-profile-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-application-profile-modal',
  templateUrl: './application-profile-modal.component.html',
  styleUrls: ['./application-profile-modal.component.css'],
})
export class ApplicationProfileModalComponent implements OnInit {
  public ModalMode: ModalMode;
  public applicationProfileId: string;
  public form: FormGroup;
  public submitted: boolean;
  public endpointGroupsTableData: EndpointGroupPaginationResponse;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public selectedEndpointGroup: EndpointGroup;
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 5;
  private tenantId: string;

  public endpointGroups: EndpointGroup[];

  public config: TableConfig<any> = {
    description: 'Endpoint Groups',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
    ],
  };

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private router: Router,
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
    this.getEndpointGroupsTableData();
    this.getEndpointGroups();
    this.buildForm();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getEndpointGroupsTableData(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('applicationProfileModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('applicationProfileModal') as ApplicationProfileModalDto);
    this.ModalMode = dto.ModalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.applicationProfileId = dto.ApplicationProfile.id;
    } else {
      this.form.controls.name.enable();
    }

    const applicationProfile = dto.ApplicationProfile;
    if (applicationProfile !== undefined) {
      this.form.controls.name.setValue(applicationProfile.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(applicationProfile.description);
      this.form.controls.alias.setValue(applicationProfile.alias);
    }
    this.ngx.resetModalData('applicationProfileModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('applicationProfileModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  private createApplicationProfile(applicationProfile: ApplicationProfile): void {
    this.applicationProfileService.createApplicationProfile({ applicationProfile }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editApplicationProfile(applicationProfile: ApplicationProfile): void {
    applicationProfile.name = null;
    this.applicationProfileService
      .updateApplicationProfile({
        uuid: this.applicationProfileId,
        applicationProfile,
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

    const { name, description, alias } = this.form.value;
    const tenantId = this.tenantId;
    const applicationProfile = {
      name,
      description,
      alias,
      tenantId,
    } as ApplicationProfile;

    if (this.ModalMode === ModalMode.Create) {
      this.createApplicationProfile(applicationProfile);
    } else {
      this.editApplicationProfile(applicationProfile);
    }
  }

  public getEndpointGroupsTableData(event?): void {
    this.isLoading = true;
    let eventParams;
    if (event) {
      this.tableComponentDto.page = event.page ? event.page : 1;
      this.tableComponentDto.perPage = event.perPage ? event.perPage : 5;
      const { searchText } = event;
      const propertyName = event.searchColumn ? event.searchColumn : null;
      if (propertyName) {
        eventParams = `${propertyName}||cont||${searchText}`;
      }
      this.endpointGroupService
        .findAllEndpointGroup({
          filter: [`applicationProfileId||eq||${this.applicationProfileId}`, eventParams],
          page: this.tableComponentDto.page,
          perPage: this.tableComponentDto.perPage,
        })
        .subscribe(
          data => {
            this.endpointGroupsTableData = data;
          },
          () => {
            this.endpointGroupsTableData = null;
          },
          () => {
            this.isLoading = false;
          },
        );
    }
  }

  public getEndpointGroups(): void {
    this.isLoading = true;
    this.endpointGroupService
      .findAllEndpointGroup({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.endpointGroups = data.data;
        },
        () => {
          this.endpointGroupsTableData = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public addEndpointGroup(): void {
    this.endpointGroupService
      .updateEndpointGroup({
        uuid: this.selectedEndpointGroup.id,
        endpointGroup: { applicationProfileId: this.applicationProfileId } as EndpointGroup,
      })
      .subscribe(
        data => {},
        err => (this.endpointGroupsTableData = null),
        () => this.getEndpointGroupsTableData(),
      );
  }
}
