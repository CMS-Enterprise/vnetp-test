import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
  ApplicationProfile,
  EndpointGroup,
  GetManyBridgeDomainResponseDto,
  GetManyEndpointGroupResponseDto,
  V2AppCentricApplicationProfilesService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ApplicationProfileModalDto } from 'src/app/models/appcentric/application-profile-modal-dto';
import { EndpointGroupModalDto } from 'src/app/models/appcentric/endpoint-group-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { TableContextService } from 'src/app/services/table-context.service';
import ObjectUtil from 'src/app/utils/ObjectUtil';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-application-profile-modal',
  templateUrl: './application-profile-modal.component.html',
  styleUrls: ['./application-profile-modal.component.css'],
})
export class ApplicationProfileModalComponent implements OnInit {
  public modalMode: ModalMode;
  public ModalMode = ModalMode;
  public applicationProfileId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public endpointGroups: GetManyEndpointGroupResponseDto;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public selectedEndpointGroup: EndpointGroup;
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 5;
  @Input() tenantId;
  public apEndpointGroupModalSubscription: Subscription;
  public bridgeDomains: GetManyBridgeDomainResponseDto;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

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
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
    private endpointGroupService: V2AppCentricEndpointGroupsService,
    private tableContextService: TableContextService,
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getBridgeDomains();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getEndpointGroups();
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
    this.modalMode = dto.ModalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.applicationProfileId = dto.ApplicationProfile.id;
      this.getEndpointGroups();
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
    this.applicationProfileService.createOneApplicationProfile({ applicationProfile }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editApplicationProfile(applicationProfile: ApplicationProfile): void {
    delete applicationProfile.name;
    delete applicationProfile.tenantId;

    this.applicationProfileService
      .updateOneApplicationProfile({
        id: this.applicationProfileId,
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

    if (this.modalMode === ModalMode.Create) {
      this.createApplicationProfile(applicationProfile);
    } else {
      this.editApplicationProfile(applicationProfile);
    }
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
      .getManyEndpointGroup({
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
      const modalDto = new YesNoModalDto(
        'Delete Endpoint Group',
        `Are you sure you want to permanently delete this endpoint group ${endpointGroup.name}?`,
      );
      const onConfirm = () => {
        this.endpointGroupService.deleteOneEndpointGroup({ id: endpointGroup.id }).subscribe(() => {
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
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    } else {
      const modalDto = new YesNoModalDto(
        'Delete Endpoint Group',
        `Are you sure you want to soft delete this endpoint group ${endpointGroup.name}?`,
      );
      const onConfirm = () => {
        this.endpointGroupService
          .softDeleteOneEndpointGroup({
            id: endpointGroup.id,
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
      };
      SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
    }
  }

  public restoreEndpointGroup(endpointGroup: EndpointGroup): void {
    if (!endpointGroup.deletedAt) {
      return;
    }

    this.endpointGroupService
      .restoreOneEndpointGroup({
        id: endpointGroup.id,
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

  public openApEndpointGroupModal(modalMode: ModalMode, endpointGroup?: EndpointGroup): void {
    const dto = new EndpointGroupModalDto();

    dto.modalMode = modalMode;

    dto.endpointGroup = endpointGroup;

    this.subscribeToApEndpointGroupModal();
    this.ngx.setModalData(dto, 'endpointGroupModal');
    this.ngx.getModal('endpointGroupModal').open();
  }

  private subscribeToApEndpointGroupModal(): void {
    this.apEndpointGroupModalSubscription = this.ngx.getModal('endpointGroupModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('endpointGroupModal');
      this.apEndpointGroupModalSubscription.unsubscribe();
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

  sanitizeData(entities: any) {
    return entities.map(entity => {
      this.mapToCsv(entity);
      return entity;
    });
  }

  mapToCsv = obj => {
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
      if (key === 'tenantName') {
        obj.tenantId = this.tenantId;
        delete obj[key];
      }
      if (key === 'applicationProfileName') {
        obj.applicationProfileId = this.applicationProfileId;
        delete obj[key];
      }
      if (key === 'bridgeDomainName') {
        obj[key] = ObjectUtil.getObjectId(val as string, this.bridgeDomains.data);
        obj.bridgeDomainId = obj[key];
        delete obj[key];
      }
    });
    return obj;
  };

  public importEndpointGroups(event): void {
    const modalDto = new YesNoModalDto(
      'Import Endpoint Groups',
      `Are you sure you would like to import ${event.length} Endpoint Group${event.length > 1 ? 's' : ''}?`,
    );

    const onConfirm = () => {
      const dto = this.sanitizeData(event);
      this.endpointGroupService.createManyEndpointGroup({ createManyEndpointGroupDto: { bulk: dto } }).subscribe(
        () => {},
        () => {},
        () => {
          this.getEndpointGroups();
        },
      );
    };
    const onClose = () => {
      this.getEndpointGroups();
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm, onClose);
  }

  private getBridgeDomains(): void {
    this.isLoading = true;
    this.bridgeDomainService
      .getManyBridgeDomain({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.bridgeDomains = data;
        },
        () => {
          this.bridgeDomains = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }
}
