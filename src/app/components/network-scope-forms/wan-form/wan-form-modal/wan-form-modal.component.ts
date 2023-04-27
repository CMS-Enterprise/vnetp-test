import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExternalRoute, ExternalRoutePaginationResponse } from 'client';
import { UpdateWanFormWanFormRequestParams, V1NetworkScopeFormsWanFormService } from 'client/api/v1NetworkScopeFormsWanForm.service';
import { WanForm } from 'client/model/wanForm';
import { WanFormDto } from 'client/model/wanFormDto';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { SearchColumnConfig } from 'src/app/common/seach-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ExternalRouteModalDto } from 'src/app/models/network-scope-forms/external-route-modal.dto';
import { WanFormModalDto } from 'src/app/models/network-scope-forms/wan-form-modal.dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { TableContextService } from 'src/app/services/table-context.service';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-wan-form-modal',
  templateUrl: './wan-form-modal.component.html',
  styleUrls: ['./wan-form-modal.component.css'],
})
export class WanFormModalComponent implements OnInit, OnDestroy {
  public modalMode: ModalMode;
  public ModalMode = ModalMode;
  public form: FormGroup;
  public submitted: boolean;
  public isLoading = false;
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 5;
  public externalRoutesModalSubscription: Subscription;
  public wanFormId: string;
  public datacenterId: string;
  public currentDatacenterSubscription: Subscription;
  public externalRoutes: ExternalRoutePaginationResponse;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('vrfNameTemplate') vrfNameTemplate: TemplateRef<any>;

  public config: TableConfig<any> = {
    description: 'External Routes',
    columns: [
      { name: 'IP', property: 'externalRouteIp' },
      { name: 'Description', property: 'description' },
      { name: 'VRF/Zone', template: () => this.vrfNameTemplate },
      { name: 'Environment', property: 'environment' },
      { name: '', template: () => this.actionsTemplate },
    ],
  };

  constructor(
    private ngx: NgxSmartModalService,
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private tableContextService: TableContextService,
    private formBuilder: FormBuilder,
    private datacenterContextService: DatacenterContextService,
  ) {}

  ngOnInit(): void {
    this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
      if (cd) {
        this.datacenterId = cd.id;
      }
    });
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.currentDatacenterSubscription.unsubscribe();
  }

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
    this.getExternalRoutes();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('wanFormModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('wanFormModal') as WanFormModalDto);
    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.wanFormId = dto.wanForm.id;
      this.getExternalRoutes();
    } else {
      this.form.controls.name.enable();
    }

    const wanForm = dto.wanForm;
    if (wanForm !== undefined) {
      this.form.controls.name.setValue(wanForm.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(wanForm.description);
    }
    this.ngx.resetModalData('wanFormModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('wanFormModal');
    this.buildForm();
  }

  public buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  public createWanForm(wanForm: WanForm): void {
    const dto: WanFormDto = {
      name: wanForm.name,
      description: wanForm.description,
      datacenterId: wanForm.datacenterId,
    };
    this.wanFormService
      .createWanFormWanForm({
        wanFormDto: dto,
      })
      .subscribe(() => {
        this.closeModal();
      });
  }

  public editWanForm(wanForm: WanForm): void {
    wanForm.name = null;

    this.wanFormService
      .updateWanFormWanForm({
        id: this.wanFormId,
        wanForm,
      })
      .subscribe(() => {
        this.closeModal();
      });
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description, alias } = this.form.value;
    const datacenterId = this.datacenterId;
    const wanForm = {
      name,
      description,
      alias,
      datacenterId,
    } as WanForm;

    if (this.modalMode === ModalMode.Create) {
      this.createWanForm(wanForm);
    } else {
      this.editWanForm(wanForm);
    }
  }

  public getExternalRoutes(event?) {
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
    this.wanFormService
      .getManyExternalRoutesWanForm({
        wanFormId: this.wanFormId,
        page: this.tableComponentDto.page,
        perPage: this.tableComponentDto.perPage,
      })
      .subscribe(
        data => {
          this.externalRoutes = data;
        },
        error => {
          this.externalRoutes = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public deleteExternalRoute(externalRoute: ExternalRoute): void {
    this.isLoading = true;
    this.wanFormService
      .deleteExternalRouteWanForm({
        externalRouteId: externalRoute.id,
        wanFormId: this.wanFormId,
      })
      .subscribe(
        data => {
          this.getExternalRoutes();
        },
        error => {
          this.isLoading = false;
        },
        () => {
          this.isLoading = false;
        },
      );
  }

  public openExternalRouteModal(modalMode: ModalMode, externalRoute?: ExternalRoute): void {
    const dto = new ExternalRouteModalDto();

    dto.modalMode = modalMode;
    dto.wanFormId = this.wanFormId;
    dto.externalRoute = externalRoute;

    this.subscribeToExternalRouteModal();
    this.ngx.setModalData(dto, 'externalRouteModal');
    this.ngx.getModal('externalRouteModal').open();
  }

  private subscribeToExternalRouteModal(): void {
    this.externalRoutesModalSubscription = this.ngx.getModal('externalRouteModal').onCloseFinished.subscribe(() => {
      this.ngx.resetModalData('externalRouteModal');
      this.externalRoutesModalSubscription.unsubscribe();
      const params = this.tableContextService.getSearchLocalStorage();
      const { filteredResults } = params;

      if (filteredResults) {
        this.getExternalRoutes(params);
      } else {
        this.getExternalRoutes();
      }
    });
  }
}
