import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { GetManyVrfResponseDto, L3Out, V2AppCentricL3outsService, V2AppCentricVrfsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { L3OutsModalDto } from 'src/app/models/appcentric/l3-outs-model-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { NameValidator } from 'src/app/validators/name-validator';

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
    private router: Router,
    private vrfService: V2AppCentricVrfsService,
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
    }
    this.ngx.resetModalData('l3OutsModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('l3OutsModal');
    this.buildForm();
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
    l3Out.name = null;
    l3Out.tenantId = null;
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
    console.log('this.form', this.form);
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
