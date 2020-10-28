import { OnDestroy, OnInit, Output, EventEmitter, Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ActifioLogicalGroupDto,
  ActifioProfileDto,
  ActifioTemplateDto,
  V1AgmLogicalGroupsService,
  V1AgmProfilesService,
  V1AgmTemplatesService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

export interface Unmanaged {
  type: 'none';
}

export interface ApplySla {
  type: 'sla';
  templateId: string;
  profileId: string;
}

export interface AddToLogicalGroup {
  type: 'logical-group';
  logicalGroupId: string;
}

@Component({
  selector: 'app-select-action',
  templateUrl: './select-action.component.html',
})
export class SelectActionComponent implements OnInit, OnDestroy {
  @Output() actionSelected = new EventEmitter<Unmanaged | ApplySla | AddToLogicalGroup>();

  public submitted = false;
  public form: FormGroup;

  public actions = [
    { type: 'none', name: 'Unmanaged' },
    { type: 'logical-group', name: 'Add to Logical Group' },
    { type: 'sla', name: 'Apply SLA' },
  ];

  public logicalGroups: ActifioLogicalGroupDto[] = [];
  public isLoadingLogicalGroups = false;

  public templates: ActifioTemplateDto[] = [];
  public isLoadingTemplates = false;

  public profiles: ActifioProfileDto[] = [];
  public isLoadingProfiles = false;

  constructor(
    private formBuilder: FormBuilder,
    private logicalGroupService: V1AgmLogicalGroupsService,
    private ngx: NgxSmartModalService,
    private profileService: V1AgmProfilesService,
    private templateService: V1AgmTemplatesService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.loadLogicalGroups();
    this.loadProfiles();
    this.loadTemplates();
    this.initForm();
  }

  ngOnDestroy(): void {
    this.reset();
  }

  public getConfirmText(): string {
    const { actionType } = this.form.value;

    if (actionType === 'logical-group') {
      return 'Add to Logical Group';
    }

    if (actionType === 'sla') {
      return 'Apply SLA';
    }

    return 'Add as Unmanaged';
  }

  public onCancel(): void {
    this.ngx.close('vmDiscoveryModal');
  }

  public onConfirm(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.actionSelected.emit(this.getEmitData());
  }

  private loadLogicalGroups(): void {
    this.isLoadingLogicalGroups = true;
    this.logicalGroupService.v1AgmLogicalGroupsGet().subscribe(data => {
      this.logicalGroups = data;
      this.isLoadingLogicalGroups = false;
    });
  }

  private loadProfiles(): void {
    this.isLoadingProfiles = true;
    this.profileService.v1AgmProfilesGet({ limit: 100, offset: 0 }).subscribe(data => {
      this.profiles = data;
      this.isLoadingProfiles = false;
    });
  }

  private loadTemplates(): void {
    this.isLoadingTemplates = true;
    this.templateService.v1AgmTemplatesGet().subscribe(data => {
      this.templates = data;
      this.isLoadingTemplates = false;
    });
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      actionType: [this.actions[0].type, Validators.required],
      templateId: [null, this.optionallyRequired(() => this.f.actionType.value === 'sla')],
      profileId: [null, this.optionallyRequired(() => this.f.actionType.value === 'sla')],
      logicalGroupId: [null, this.optionallyRequired(() => this.f.actionType.value === 'logical-group')],
    });
  }

  private getEmitData(): Unmanaged | ApplySla | AddToLogicalGroup {
    const { actionType } = this.form.value;

    if (actionType === 'logical-group') {
      return { type: 'logical-group', logicalGroupId: this.form.value.logicalGroupId };
    }

    if (actionType === 'sla') {
      const { templateId, profileId } = this.form.value;
      return { type: 'sla', templateId, profileId };
    }

    return { type: 'none' };
  }

  private optionallyRequired(isRequiredFn: () => boolean): (control: AbstractControl) => { required: true } | null {
    return (control: AbstractControl) => {
      if (!control) {
        return null;
      }

      const { value } = control;
      if (!value) {
        return null;
      }

      return isRequiredFn() ? { required: true } : null;
    };
  }

  private reset(): void {
    this.submitted = false;
    this.form.reset();
    this.form.controls.actionType.setValue(this.actions[0].type);
  }
}
