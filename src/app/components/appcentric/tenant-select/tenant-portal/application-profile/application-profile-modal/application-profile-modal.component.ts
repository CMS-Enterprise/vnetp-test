import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import {
  ApplicationProfile,
  GetManyBridgeDomainResponseDto,
  V2AppCentricApplicationProfilesService,
  V2AppCentricBridgeDomainsService,
} from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ApplicationProfileModalDto } from 'src/app/models/appcentric/application-profile-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { NameValidator } from 'src/app/validators/name-validator';

@Component({
  selector: 'app-application-profile-modal',
  templateUrl: './application-profile-modal.component.html',
  styleUrls: ['./application-profile-modal.component.css'],
})
export class ApplicationProfileModalComponent implements OnInit {
  public modalMode: ModalMode;
  public ModalMode = ModalMode;
  public applicationProfileId: string;
  public form: UntypedFormGroup;
  public submitted: boolean;
  public isLoading = false;
  @Input() tenantId;
  public bridgeDomains: GetManyBridgeDomainResponseDto;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private ngx: NgxSmartModalService,
    private applicationProfileService: V2AppCentricApplicationProfilesService,
    private bridgeDomainService: V2AppCentricBridgeDomainsService,
  ) {}

  ngOnInit(): void {
    this.buildForm();
    this.getBridgeDomains();
  }

  get f() {
    return this.form.controls;
  }

  public closeModal(): void {
    this.ngx.close('applicationProfileModal');
    this.reset();
  }

  public getData(): void {
    const dto = Object.assign({}, this.ngx.getModalData('applicationProfileModal') as ApplicationProfileModalDto);
    this.modalMode = dto.ModalMode;
    if (this.modalMode === ModalMode.Edit) {
      this.applicationProfileId = dto.ApplicationProfile.id;
    } else {
      this.form.controls.name.enable();
    }

    const applicationProfile = dto.ApplicationProfile;
    if (applicationProfile !== undefined) {
      this.form.controls.name.setValue(applicationProfile.name);
      this.form.controls.name.disable();
      this.form.controls.description.setValue(applicationProfile.description);
      this.form.controls.alias.setValue(applicationProfile.alias);
    }
    this.ngx.resetModalData('applicationProfileModal');
  }

  public reset(): void {
    this.submitted = false;
    this.ngx.resetModalData('applicationProfileModal');
    this.buildForm();
  }

  private buildForm(): void {
    this.form = this.formBuilder.group({
      name: ['', NameValidator()],
      alias: ['', Validators.compose([Validators.maxLength(100)])],
      description: ['', Validators.compose([Validators.maxLength(500)])],
    });
  }

  private createApplicationProfile(applicationProfile: ApplicationProfile): void {
    this.applicationProfileService.createOneApplicationProfile({ applicationProfile }).subscribe(
      () => {
        this.closeModal();
      },
      () => {},
    );
  }

  private editApplicationProfile(applicationProfile: ApplicationProfile): void {
    delete applicationProfile.name;
    delete applicationProfile.tenantId;

    this.applicationProfileService
      .updateOneApplicationProfile({
        id: this.applicationProfileId,
        applicationProfile,
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
    const applicationProfile = {
      name,
      description,
      alias,
      tenantId,
    } as ApplicationProfile;

    if (this.modalMode === ModalMode.Create) {
      this.createApplicationProfile(applicationProfile);
    } else {
      this.editApplicationProfile(applicationProfile);
    }
  }

  public getBridgeDomains(): void {
    this.isLoading = true;
    this.bridgeDomainService
      .getManyBridgeDomain({
        filter: [`tenantId||eq||${this.tenantId}`],
        page: 1,
        perPage: 1000,
      })
      .subscribe(
        data => {
          this.bridgeDomains = data;
        },
        () => {
          this.bridgeDomains = null;
        },
        () => {
          this.isLoading = false;
        },
      );
  }
}
