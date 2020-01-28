import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadBalancerProfile, V1LoadBalancerProfilesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { ProfileModalDto } from 'src/app/models/loadbalancer/profile-modal-dto';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

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

  privateKeyCipher: string;
  publicKey: string;
  typeSubscription: Subscription;

  // TODO: Helptext

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private profileService: V1LoadBalancerProfilesService,
    private toastr: ToastrService,
  ) {}

  save() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const profile = {} as LoadBalancerProfile;
    profile.name = this.form.controls.name.value;
    profile.type = this.form.controls.type.value;

    if (profile.type === 'ClientSSL') {
      if (!this.privateKeyCipher) {
        return;
      }
      profile.key = this.privateKeyCipher;
      profile.certificate = this.form.controls.certificate.value;
    }

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

  importPrivateKeyCipher(evt: any) {
    const files = evt.target.files;
    const file = files[0];
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = () => {
      const result = reader.result.toString();

      if (
        result.toUpperCase().includes('KEY') ||
        atob(result)
          .toUpperCase()
          .includes('KEY')
      ) {
        this.toastr.error('Unecrypted Private Key not Allowed.');
      }

      this.privateKeyCipher = result;
    };
  }

  getData() {
    const dto = this.ngx.getModalData(
      'loadBalancerProfileModal',
    ) as ProfileModalDto;

    if (!dto.ModalMode) {
      throw Error('Modal Mode not Set.');
    } else {
      this.ModalMode = dto.ModalMode;

      if (this.ModalMode === ModalMode.Edit) {
        this.ProfileId = dto.Profile.id;
      }
    }

    this.TierId = dto.TierId;
    const profile = dto.Profile;

    if (profile !== undefined) {
      this.form.controls.type.disable();
      this.form.controls.name.disable();
      this.form.controls.name.setValue(dto.Profile.name);
      this.form.controls.type.setValue(dto.Profile.type);

      if (dto.Profile.type === 'ClientSSL') {
        this.privateKeyCipher = dto.Profile.key || null;
        this.form.controls.certificate.setValue(dto.Profile.certificate);
      }
    }
    this.ngx.resetModalData('loadBalancerProfileModal');
  }

  private setFormValidators() {
    const certificate = this.form.controls.certificate;
    const ciphers = this.form.controls.ciphers;

    this.typeSubscription = this.form.controls.type.valueChanges.subscribe(
      type => {
        switch (type) {
          case 'ClientSSL':
            certificate.setValidators(Validators.required);
            certificate.setValue(null);
            break;
          case 'Http':
            certificate.setValidators(null);
            certificate.setValue(null);
            break;
        }

        certificate.updateValueAndValidity();
        ciphers.updateValueAndValidity();
      },
    );
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      type: ['', Validators.required],
      certificate: [null],
    });
  }

  private reset() {
    this.submitted = false;
    this.privateKeyCipher = null;
    this.buildForm();
    this.setFormValidators();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }
}
