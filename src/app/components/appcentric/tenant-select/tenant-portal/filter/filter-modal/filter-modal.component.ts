import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, NavigationEnd } from '@angular/router';
import { Filter, V2AppCentricFiltersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FilterModalDto } from 'src/app/models/appcentric/filter-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-filter-modal',
  templateUrl: './filter-modal.component.html',
  styleUrls: ['./filter-modal.component.css'],
})
export class FilterModalComponent implements OnInit {
  public modalMode: ModalMode;
  public filterId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private filterService: V2AppCentricFiltersService,
    private router: Router,
  ) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const match = event.url.match(/\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\//);
        if (match) this.tenantId = match[1];
      }
    });
  }

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('filterModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('filterModal') as FilterModalDto);

    this.modalMode = dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.filterId = dto.filter.id;
    } else {
      this.form.controls.name.enable();
    }

    const filter = dto.filter;
    if (filter !== undefined) {
      this.form.controls.name.setValue(filter.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(filter.description);
      this.form.controls.alias.setValue(filter.alias);
    }
    this.ngx.resetModalData('filterModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('filterModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.required, Validators.minLength(3), Validators.maxLength(100)])],
      alias: [null],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
    });
  }

  private createFilter(filter: Filter): void {
    this.filterService.createFilter({ filter }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editFilter(filter: Filter): void {
    filter.name = null;
    this.filterService
      .updateFilter({
        uuid: this.filterId,
        filter,
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
    const filter = {
      name,
      description,
      alias,
      tenantId,
    } as Filter;

    if (this.modalMode === ModalMode.Create) {
      this.createFilter(filter);
    } else {
      this.editFilter(filter);
    }
  }
}
