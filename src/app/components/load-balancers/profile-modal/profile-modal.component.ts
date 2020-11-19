import { Component, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadBalancerProfile, V1LoadBalancerProfilesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import { ProfileModalDto } from 'src/app/models/loadbalancer/profile-modal-dto';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ProfilesHelpText } from 'src/app/helptext/help-text-networking';
import { NameValidator } from 'src/app/validators/name-validator';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

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

  constructor(
    private ngx: NgxSmartModalService,
    private formBuilder: FormBuilder,
    private profileService: V1LoadBalancerProfilesService,
    private toastr: ToastrService,
    public helpText: ProfilesHelpText,
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

      if (this.isUnencryptedPrivateKey(profile.key) || this.isUnencryptedPrivateKey(profile.certificate)) {
        this.toastr.error('Unencrypted Private Key not Allowed.');
        return;
      }
    }
    if (profile.type === 'Http') {
      profile.reverseProxy = this.form.controls.reverseProxy.value;
    }

    if (this.ModalMode === ModalMode.Create) {
      profile.tierId = this.TierId;
      this.profileService
        .v1LoadBalancerProfilesPost({
          loadBalancerProfile: profile,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    } else {
      this.profileService
        .v1LoadBalancerProfilesIdPut({
          id: this.ProfileId,
          loadBalancerProfile: profile,
        })
        .subscribe(
          () => {
            this.closeModal();
          },
          () => {},
        );
    }
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

  removeProfile(profile: LoadBalancerProfile): void {
    const modalDto = new YesNoModalDto('Remove Profile', '');
    const onConfirm = () => {
      this.profileService.v1LoadBalancerProfilesIdDelete({ id: profile.id }).subscribe(() => {
        this.getProfiles();
      });
    };
    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  private getProfiles() {
    this.profileService.v1LoadBalancerProfilesIdGet({ id: this.Profile.id }).subscribe(data => {
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

      if (!this.isUnencryptedPrivateKey(result)) {
        this.privateKeyCipher = result;
      } else {
        this.toastr.error('Unencrypted Private Key not Allowed.');
        return;
      }
    };
  }

  private isUnencryptedPrivateKey(result: string): boolean {
    try {
      const isKey = result.toUpperCase().includes('KEY');
      const base64IsKey = atob(result)
        .toUpperCase()
        .includes('KEY');
      return isKey || base64IsKey;
    } catch {
      return false;
    }
  }

  getData() {
    const dto = this.ngx.getModalData('loadBalancerProfileModal') as ProfileModalDto;

    this.ModalMode = dto.ModalMode;
    if (this.ModalMode === ModalMode.Edit) {
      this.ProfileId = dto.Profile.id;
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }

    this.TierId = dto.TierId;
    if (dto.Profile !== undefined) {
      this.form.controls.name.setValue(dto.Profile.name);
      this.form.controls.name.disable();
      this.form.controls.type.setValue(dto.Profile.type);
      this.form.controls.type.disable();

      if (dto.Profile.type === 'ClientSSL') {
        this.privateKeyCipher = dto.Profile.key || null;
        this.form.controls.certificate.setValue(dto.Profile.certificate);
      }
      if (dto.Profile.type === 'Http') {
        this.form.controls.reverseProxy.setValue(dto.Profile.reverseProxy);
      }
    }
    this.ngx.resetModalData('loadBalancerProfileModal');
  }

  private setFormValidators() {
    const certificate = this.form.controls.certificate;

    this.typeSubscription = this.form.controls.type.valueChanges.subscribe(type => {
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
    });
  }

  private buildForm() {
    this.form = this.formBuilder.group({
      name: ['', Validators.compose([Validators.required, Validators.minLength(3), Validators.maxLength(100), NameValidator])],
      type: ['', Validators.required],
      certificate: [null],
      reverseProxy: null,
    });
  }

  public reset() {
    this.submitted = false;
    this.privateKeyCipher = null;
    this.ProfileId = null;
    this.buildForm();
    this.setFormValidators();
  }

  ngOnInit() {
    this.buildForm();
    this.setFormValidators();
  }
}
