import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadBalancerProfile, LoadBalancerProfileType, V1LoadBalancerProfilesService } from 'api_client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';
import { ProfileModalDto } from './profile-modal.dto';
import ValidatorUtil from 'src/app/utils/ValidatorUtil';
import { Subscription } from 'rxjs';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-profile-modal',
  templateUrl: './profile-modal.component.html',
})
export class ProfileModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public submitted: boolean;
  public ProfileType = LoadBalancerProfileType;

  public reverseProxyTypes: ProfileReverseProxyType[] = Object.keys(ProfileReverseProxyType).map(k => {
    return ProfileReverseProxyType[k];
  });
  public privateKeyCipher: string;

  private profileId: string;
  private modalMode: ModalMode;
  private tierId: string;
  private typeChanges: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private profileService: V1LoadBalancerProfilesService,
    private toastr: ToastrService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.typeChanges = this.subscribeToTypeChanges();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.typeChanges]);
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('profileModal');
    this.submitted = false;
    this.privateKeyCipher = null;
    this.profileId = null;
    this.buildForm();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const profile = this.getProfileForSave();
    if (!profile) {
      return;
    }

    if (this.modalMode === ModalMode.Create) {
      this.createProfile(profile);
    } else {
      this.updateProfile(profile);
    }
  }

  public getData(): void {
    const dto: ProfileModalDto = Object.assign({}, this.ngx.getModalData('profileModal'));
    const { profile, tierId } = dto;
    this.tierId = tierId;
    this.modalMode = profile ? ModalMode.Edit : ModalMode.Create;

    if (this.modalMode === ModalMode.Edit) {
      const { name, type, id, certificate, reverseProxy, key, description } = profile;
      this.profileId = id;

      this.form.controls.name.disable();
      this.form.controls.type.disable();

      this.form.controls.description.setValue(description);
      this.form.controls.name.setValue(name);
      this.form.controls.type.setValue(type);

      if (type === LoadBalancerProfileType.ClientSSL) {
        this.privateKeyCipher = key || null;
        this.form.controls.certificate.setValue(certificate);
      }

      if (type === LoadBalancerProfileType.Http) {
        this.form.controls.reverseProxy.setValue(reverseProxy);
      }
    } else {
      this.form.controls.name.enable();
      this.form.controls.type.enable();
    }
    this.ngx.resetModalData('profileModal');
  }

  public importPrivateKeyCipher(evt: any): void {
    const [file] = evt.target.files;
    const reader = new FileReader();

    reader.onload = () => {
      const key = reader.result.toString();

      if (this.isUnencryptedPrivateKey(key)) {
        this.toastr.error('Unencrypted Private Key not allowed.');
        return;
      }

      this.privateKeyCipher = key;
    };
    reader.readAsText(file);
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      certificate: [
        null,
        Validators.compose([
          Validators.minLength(50),
          ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerProfileType.ClientSSL),
        ]),
      ],
      description: ['', Validators.compose([Validators.minLength(3), Validators.maxLength(500)])],
      name: ['', NameValidator()],
      reverseProxy: [null, ValidatorUtil.optionallyRequired(() => this.form.get('type').value === LoadBalancerProfileType.Http)],
      type: ['', Validators.required],
    });
  }

  private createProfile(loadBalancerProfile: LoadBalancerProfile): void {
    this.profileService.v1LoadBalancerProfilesPost({ loadBalancerProfile }).subscribe(
      () => this.closeModal(),
      () => {},
    );
  }

  private updateProfile(loadBalancerProfile: LoadBalancerProfile): void {
    loadBalancerProfile.tierId = null;
    this.profileService
      .v1LoadBalancerProfilesIdPut({
        id: this.profileId,
        loadBalancerProfile,
      })
      .subscribe(
        () => this.closeModal(),
        () => {},
      );
  }

  private getProfileForSave(): LoadBalancerProfile {
    const { name, type, reverseProxy, certificate, description } = this.form.getRawValue();

    if (type === LoadBalancerProfileType.ClientSSL) {
      if (!this.privateKeyCipher) {
        this.toastr.error('Private Key is required.');
        return null;
      }

      if (this.isUnencryptedPrivateKey(this.privateKeyCipher) || this.isUnencryptedPrivateKey(certificate)) {
        this.toastr.error('Unencrypted Private Key not allowed.');
        return null;
      }

      return {
        certificate,
        description,
        name,
        type,
        key: this.privateKeyCipher,
        properties: null,
        reverseProxy: null,
        tierId: this.tierId,
      };
    }

    if (type === LoadBalancerProfileType.Http) {
      return {
        description,
        name,
        reverseProxy,
        type,
        certificate: null,
        key: null,
        properties: null,
        tierId: this.tierId,
      };
    }

    return null;
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

  private subscribeToTypeChanges(): Subscription {
    const { certificate } = this.form.controls;

    return this.form.get('type').valueChanges.subscribe(() => {
      certificate.setValue(null);
      certificate.updateValueAndValidity();
    });
  }
}

// TODO: Generate from API
export enum ProfileReverseProxyType {
  Explicit = 'Explicit',
  Reverse = 'Reverse',
  Transparent = 'Transparent',
}
