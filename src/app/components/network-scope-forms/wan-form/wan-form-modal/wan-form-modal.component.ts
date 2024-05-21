import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { WanForm } from 'client/model/wanForm';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Subscription } from 'rxjs';
import { WanFormModalDto } from 'src/app/models/network-scope-forms/wan-form-modal.dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { NameValidator } from 'src/app/validators/name-validator';
import { SearchColumnConfig } from '../../../../common/search-bar/search-bar.component';
import { V1NetworkScopeFormsWanFormService } from '../../../../../../client/api/v1NetworkScopeFormsWanForm.service';
import { ActivatedRoute } from '@angular/router';

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
  public wanFormId: string;
  public datacenterId: string;
  public currentDatacenterSubscription: Subscription;
  public tenantId: string;
  public dcsMode: string;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;
  @ViewChild('vrfNameTemplate') vrfNameTemplate: TemplateRef<any>;

  constructor(
    private ngx: NgxSmartModalService,
    private wanFormService: V1NetworkScopeFormsWanFormService,
    private formBuilder: FormBuilder,
    private datacenterContextService: DatacenterContextService,
    private route: ActivatedRoute,
  ) {
    this.tenantId = this.route.snapshot.queryParams.tenantId;
  }

  ngOnInit(): void {
    this.dcsMode = this.route.snapshot.data.mode;
    if (this.dcsMode === 'netcentric') {
      this.currentDatacenterSubscription = this.datacenterContextService.currentDatacenter.subscribe(cd => {
        if (cd) {
          this.datacenterId = cd.id;
        }
      });
    }
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.currentDatacenterSubscription?.unsubscribe();
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

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const { name, description } = this.form.value;
    const wanForm = {
      name,
      description,
    } as WanForm;

    if (this.dcsMode === 'netcentric') {
      wanForm.datacenterId = this.datacenterId;
    } else {
      wanForm.tenantId = this.tenantId;
    }

    if (this.modalMode === ModalMode.Create) {
      this.wanFormService.createOneWanForm({ wanForm }).subscribe(() => {
        this.closeModal();
      });
    } else {
      this.wanFormService.updateOneWanForm({ id: this.wanFormId, wanForm }).subscribe(() => {
        this.closeModal();
      });
    }
  }
}
