import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { RouteProfile, V2AppCentricRouteProfilesService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { RouteProfileModalDto } from '../../../../../../models/appcentric/route-profile-modal-dto';

@Component({
  selector: 'app-route-profile-modal',
  templateUrl: './route-profile-modal.component.html',
})
export class RouteProfileModalComponent implements OnInit {
  public modalMode: ModalMode;
  public routeProfileId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  @Input() public tenantId: string;
  public isLoading = false;

  public dto: RouteProfileModalDto;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private routeProfileService: V2AppCentricRouteProfilesService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('routeProfileModal');
    this.reset();
  }

  public getData(): void {
    this.dto = Object.assign({}, this.ngx.getModalData('routeProfileModal') as RouteProfileModalDto);

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
    this.ngx.resetModalData('routeProfileModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('routeProfileModal');
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
    this.routeProfileService.createOneRouteProfile({ routeProfile }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editRouteProfile(routeProfile: RouteProfile): void {
    delete routeProfile.name;
    delete routeProfile.tenantId;
    this.routeProfileService
      .updateOneRouteProfile({
        id: this.routeProfileId,
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

    const { name, description, alias } = this.form.value;
    const tenantId = this.tenantId;
    const routeProfile = {
      name,
      description,
      alias,
      tenantId,
    } as RouteProfile;

    if (this.modalMode === ModalMode.Create) {
      this.createRouteProfile(routeProfile);
    } else {
      this.editRouteProfile(routeProfile);
    }
  }
}
