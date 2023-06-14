import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { RouteProfile, V2AppCentricRouteProfilesService, V2AppCentricVrfsService, Vrf, VrfPaginationResponse } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { SearchColumnConfig } from 'src/app/common/search-bar/search-bar.component';
import { TableConfig } from 'src/app/common/table/table.component';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { TableComponentDto } from 'src/app/models/other/table-component-dto';
import { NameValidator } from 'src/app/validators/name-validator';
import { RouteProfileModalDto } from '../../../../../../models/appcentric/route-profile-modal-dto';

@Component({
  selector: 'app-route-profile-modal',
  templateUrl: './route-profile-modal.component.html',
})
export class RouteProfileModalComponent implements OnInit {
  public modalMode: ModalMode;
  public routeProfileId: string;
  public form: FormGroup;
  public submitted: boolean;
  public tenantId: string;
  public tableComponentDto = new TableComponentDto();
  public searchColumns: SearchColumnConfig[] = [];
  public perPage = 5;
  public isLoading = false;
  @Input() public vrfs: VrfPaginationResponse;
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
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private routeProfileService: V2AppCentricRouteProfilesService,
    private router: Router,
    private vrfService: V2AppCentricVrfsService,
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

  public onTableEvent(event: TableComponentDto): void {
    this.tableComponentDto = event;
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('routeProfilesModal');
    this.reset();
  }

  public getData(): void {
    this.dto = Object.assign({}, this.ngx.getModalData('routeProfilesModal') as RouteProfileModalDto);

    this.modalMode = this.dto.modalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.routeProfileId = this.dto.routeProfile.id;
    } else {
      this.form.controls.name.enable();
    }

    const routeProfiles = this.dto.routeProfile;
    if (routeProfiles !== undefined) {
      this.form.controls.name.setValue(routeProfiles.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(routeProfiles.description);
      this.form.controls.alias.setValue(routeProfiles.alias);
    }
    this.ngx.resetModalData('routeProfilesModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('routeProfilesModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  private createRouteProfile(routeProfile: RouteProfile): void {
    this.routeProfileService.createRouteProfile({ routeProfile }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editRouteProfile(routeProfile: RouteProfile): void {
    routeProfile.name = null;
    routeProfile.tenantId = null;
    this.routeProfileService
      .updateRouteProfile({
        uuid: this.routeProfileId,
        routeProfile,
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
    const routeProfile = {
      name,
      description,
      alias,
      tenantId,
      vrfId,
    } as RouteProfile;

    if (this.modalMode === ModalMode.Create) {
      this.createRouteProfile(routeProfile);
    } else {
      this.editRouteProfile(routeProfile);
    }
  }
}
