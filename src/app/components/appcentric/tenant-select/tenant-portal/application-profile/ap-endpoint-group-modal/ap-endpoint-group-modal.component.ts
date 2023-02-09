import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { V2AppCentricEndpointGroupsService, EndpointGroup, EndpointGroupPaginationResponse } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ApplicationProfileModalDto } from 'src/app/models/appcentric/application-profile-modal-dto';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-ap-endpoint-group-modal',
  templateUrl: './ap-endpoint-group-modal.component.html',
  styleUrls: ['./ap-endpoint-group-modal.component.css'],
})
export class ApEndpointGroupModalComponent implements OnInit {
  public applicationProfileId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 5;
  public isLoading = false;
  public endpointGroups = {} as EndpointGroupPaginationResponse;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  private apEndpointGroupEditModalSubscription: Subscription;

  public config: TableConfig<any> = {
    description: 'Endpoint Groups',
    columns: [
      { name: 'Name', property: 'name' },
      { name: 'Alias', property: 'alias' },
      { name: 'Description', property: 'description' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private router: Router,
    private tableContextService: TableContextService,
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
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getEndpointGroups(event);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('endpointGroupModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('endpointGroupModal') as ApplicationProfileModalDto);

    this.applicationProfileId = dto.ApplicationProfile.id;
    this.getEndpointGroups();

    this.ngx.resetModalData('endpointGroupModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('endpointGroupModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
      intraEpgIsolation: [null],
    });
  }

  private createEndpointGroup(endpointGroup: EndpointGroup): void {
    this.endpointGroupService.createEndpointGroup({ endpointGroup }).subscribe(
      () => {},
      () => {},
      () => {
        this.getEndpointGroups();
        this.reset();
      },
    );
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias, intraEpgIsolation } = this.form.value;
    const tenantId = this.tenantId;
    const applicationProfileId = this.applicationProfileId;
    const endpointGroup = {
      name,
      description,
      alias,
      tenantId,
      applicationProfileId,
    } as EndpointGroup;

    endpointGroup.intraEpgIsolation = intraEpgIsolation === 'true';

    this.createEndpointGroup(endpointGroup);
  }

  public getEndpointGroups(event?): void {
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
    this.endpointGroupService
      .findAllEndpointGroup({
        filter: [`applicationProfileId||eq||${this.applicationProfileId}`, eventParams],
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.endpointGroups = data;
        },
        () => {
          this.endpointGroups = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteEndpointGroup(endpointGroup: EndpointGroup): void {
    if (endpointGroup.deletedAt) {
      this.endpointGroupService.removeEndpointGroup({ uuid: endpointGroup.id }).subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if endpointGrouped results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getEndpointGroups(params);
        } else {
          this.getEndpointGroups();
        }
      });
    } else {
      this.endpointGroupService
        .softDeleteEndpointGroup({
          uuid: endpointGroup.id,
        })
        .subscribe(() => {
          const params = this.tableContextService.getSearchLocalStorage();
          const { filteredResults } = params;

          // if endpointGrouped results boolean is true, apply search params in the
          // subsequent get call
          if (filteredResults) {
            this.getEndpointGroups(params);
          } else {
            this.getEndpointGroups();
          }
        });
    }
  }

  public restoreEndpointGroup(endpointGroup: EndpointGroup): void {
    if (!endpointGroup.deletedAt) {
      return;
    }

    this.endpointGroupService
      .restoreEndpointGroup({
        uuid: endpointGroup.id,
      })
      .subscribe(() => {
        const params = this.tableContextService.getSearchLocalStorage();
        const { filteredResults } = params;

        // if endpointGrouped results boolean is true, apply search params in the
        // subsequent get call
        if (filteredResults) {
          this.getEndpointGroups(params);
        } else {
          this.getEndpointGroups();
        }
      });
  }

  public openApEndpointGroupEditModal(endpointGroup?: EndpointGroup): void {
    const dto = new EndpointGroupModalDto();

    dto.modalMode = ModalMode.Edit;

    dto.endpointGroup = endpointGroup;

    this.subscribeToApEndpointGroupEditModal();
    this.ngx.setModalData(dto, 'apEndpointGroupEditModal');
    this.ngx.getModal('apEndpointGroupEditModal').open();
  }

  private subscribeToApEndpointGroupEditModal(): void {
    this.apEndpointGroupEditModalSubscription = this.ngx.getModal('apEndpointGroupEditModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('apEndpointGroupEditModal');
      this.apEndpointGroupEditModalSubscription.unsubscribe();
      // get search params from local storage
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      // if endpointGrouped results boolean is true, apply search params in the
      // subsequent get call
      if (filteredResults) {
        this.getEndpointGroups(params);
      } else {
        this.getEndpointGroups();
      }
    });
  }
}
