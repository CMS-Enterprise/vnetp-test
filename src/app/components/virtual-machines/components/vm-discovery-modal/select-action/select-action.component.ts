import { OnDestroy, OnInit, Output, EventEmitter, Component, Input } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import {
  ActifioApplicationDto,
  ActifioDetailedLogicalGroupDto,
  ActifioLogicalGroupDto,
  ActifioProfileDto,
  ActifioTemplateDto,
  V1AgmLogicalGroupsService,
  V1AgmProfilesService,
  V1AgmSlasService,
  V1AgmTemplatesService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Observable, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-select-action',
  templateUrl: './select-action.component.html',
})
export class SelectActionComponent implements OnInit, OnDestroy {
  @Input() virtualMachines: ActifioApplicationDto[] = [];
  @Output() actionComplete = new EventEmitter<void>();

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
    private agmSlaService: V1AgmSlasService,
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
    this.reset();
    this.ngx.close('vmDiscoveryModal');
  }

  public onConfirm(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    this.handleAction().subscribe(() => {
      this.actionComplete.emit();
    });
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
      actionType: [this.actions[0].type],
      templateId: [null, this.optionallyRequired(() => this.form.get('actionType').value === 'sla')],
      profileId: [null, this.optionallyRequired(() => this.form.get('actionType').value === 'sla')],
      logicalGroupId: [null, this.optionallyRequired(() => this.form.get('actionType').value === 'logical-group')],
    });
  }

  private handleAction(): Observable<any> {
    const { actionType } = this.form.value;

    if (actionType === 'sla') {
      const { profileId, templateId } = this.form.value;
      return this.applySlas(templateId, profileId);
    }

    if (actionType === 'logical-group') {
      return this.updateLogicalGroup(this.form.value.logicalGroupId);
    }

    return of({});
  }

  private optionallyRequired(isRequiredFn: () => boolean): ValidatorFn {
    return (control: AbstractControl) => {
      if (!control.parent) {
        return null;
      }
      return isRequiredFn() ? Validators.required(control) : null;
    };
  }

  private updateLogicalGroup(logicalGroupId: string): Observable<ActifioDetailedLogicalGroupDto> {
    return this.logicalGroupService.v1AgmLogicalGroupsIdGet({ id: logicalGroupId }).pipe(
      switchMap((logicalGroup: ActifioDetailedLogicalGroupDto) => {
        const {
          logicalGroup: { applianceId, description, sla, name },
          members,
        } = logicalGroup;

        const mapVM = (vm: ActifioApplicationDto) => {
          return {
            id: vm.id,
            applianceId: vm.applianceId,
          };
        };

        const currentMembers = members.map(mapVM);
        const newMembers = this.virtualMachines.map(mapVM);

        return this.logicalGroupService.v1AgmLogicalGroupsIdPut({
          id: logicalGroupId,
          actifioAddOrUpdateLogicalGroupDto: {
            applianceId,
            description,
            name,
            profileId: sla ? sla.profile.id : undefined,
            templateId: sla ? sla.template.id : undefined,
            members: [].concat(currentMembers, newMembers),
          },
        });
      }),
    );
  }

  private applySlas(templateId: string, profileId: string): Observable<any> {
    const createSla = (vm: ActifioApplicationDto) => {
      return this.agmSlaService.v1AgmSlasPost({
        actifioCreateOrApplySlaDto: {
          applicationId: vm.id,
          applicationName: vm.name,
          apply: true,
          slpId: profileId,
          sltId: templateId,
        },
      });
    };

    const slas = this.virtualMachines.map(vm => createSla(vm));
    return forkJoin(slas);
  }

  private reset(): void {
    this.submitted = false;
    this.form.reset();
    this.form.controls.actionType.setValue(this.actions[0].type);
  }
}
