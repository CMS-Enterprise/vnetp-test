import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadBalancerProfile, V1LoadBalancerProfilesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { ProfileModalDto } from 'src/app/models/loadbalancer/profile-modal-dto';

@Component({
  selector: 'app-load-balancer-profile-modal',
  templateUrl: './profile-modal.component.html',
})
export class ProfileModalComponent implements OnInit {
  form: FormGroup;
  submitted: boolean;
  TierId: string;
  ModalMode: ModalMode;
  Profile: LoadBalancerProfile;
  ProfileId: string;

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private profileService: V1LoadBalancerProfilesService,
  ) // public helpText: ProfileModalHelpText,
  {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const profile = {} as LoadBalancerProfile;
    profile.name = this.form.value.name;
    profile.profileType = this.form.value.type;

    if (this.ModalMode === ModalMode.Create) {
      profile.tierId = this.TierId;
      this.profileService
        .v1LoadBalancerProfilesPost({
          loadBalancerProfile: profile,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    } else {
      this.profileService
        .v1LoadBalancerProfilesIdPut({
          id: this.ProfileId,
          loadBalancerProfile: profile,
        })
        .subscribe(
          data => {
            this.closeModal();
          },
          error => {},
        );
    }

    this.closeModal();
  }

  private closeModal() {
    this.ngx.close('loadBalancerProfileModal');
    this.reset();
  }

  cancel() {
    this.ngx.close('loadBalancerProfileModal');
    this.reset();
  }

  get f() {
    return this.form.controls;
  }

  removeProfile(profile: LoadBalancerProfile) {
    const modalDto = new YesNoModalDto('Remove Profile', '');
    this.ngx.setModalData(modalDto, 'yesNoModal');
    this.ngx.getModal('yesNoModal').open();

    const yesNoModalSubscription = this.ngx
      .getModal('yesNoModal')
      .onCloseFinished.subscribe((modal: NgxSmartModalComponent) => {
        const data = modal.getData() as YesNoModalDto;
        modal.removeData();
        if (data && data.modalYes) {
          this.profileService
            .v1LoadBalancerProfilesIdDelete({ id: profile.id })
            .subscribe(() => {
              this.getProfiles();
            });
        }
        yesNoModalSubscription.unsubscribe();
      });
  }

  private getProfiles() {
    this.profileService
      .v1LoadBalancerProfilesIdGet({ id: this.Profile.id })
      .subscribe(data => {
        this.Profile = data;
      });
  }

  getData() {
    const dto = this.ngx.getModalData(
      'loadBalancerProfileModal',
    ) as ProfileModalDto;

    if (dto.TierId) {
      this.TierId = dto.TierId;
    }

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.ProfileId = dto.Profile.id;
      }
    }

    if (dto !== undefined) {
      this.form.controls.name.setValue(dto.Profile.name);
      this.form.controls.type.setValue(dto.Profile.profileType);
    }
    this.ngx.resetModalData('loadBalancerProfileModal');
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
    });
  }

  private reset() {
    this.submitted = false;
    this.buildForm();
  }

  ngOnInit() {
    this.buildForm();
  }
}
