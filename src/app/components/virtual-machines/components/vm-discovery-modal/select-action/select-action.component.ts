import { OnDestroy, OnInit, Output, EventEmitter, Component, Input } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import {
  ActifioApplicationDto,
  ActifioDetailedLogicalGroupDto,
  ActifioHostDto,
  ActifioLogicalGroupDto,
  ActifioPolicyDtoOperation,
  ActifioTemplateDto,
  V1ActifioGmLogicalGroupsService,
  V1ActifioGmProfilesService,
  V1ActifioGmSlasService,
  V1ActifioGmTemplatesService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { forkJoin, Observable, of, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import ValidatorUtil from 'src/app/utils/ValidatorUtil';

export interface Profile {
  id: string;
  name: string;
  type: 'Local' | 'Remote';
  clusterName: string;
  displayName: string;
}

@Component({
  selector: 'app-select-action',
  templateUrl: './select-action.component.html',
})
export class SelectActionComponent implements OnInit, OnDestroy {
  @Input() vCenter: ActifioHostDto;
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

  public allProfiles: Profile[] = [];
  public shownProfiles: Profile[] = [];
  public isLoadingProfiles = false;

  private templateChanges: Subscription;

  constructor(
    private agmLogicalGroupService: V1ActifioGmLogicalGroupsService,
    private agmProfileService: V1ActifioGmProfilesService,
    private agmSlaService: V1ActifioGmSlasService,
    private agmTemplateService: V1ActifioGmTemplatesService,
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.loadLogicalGroups();
    this.loadProfiles();
    this.loadTemplates();
    this.initForm();

    this.templateChanges = this.subscribeToTemplateChanges();
  }

  ngOnDestroy(): void {
    this.reset();
    SubscriptionUtil.unsubscribe([this.templateChanges]);
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
    const sourceClusterIds = new Set(this.vCenter.sourceClusterIds);

    this.isLoadingLogicalGroups = true;
    this.agmLogicalGroupService.v1ActifioGmLogicalGroupsGet({}).subscribe(logicalGroups => {
      this.logicalGroups = logicalGroups
        .filter(l => sourceClusterIds.has(l.sourceClusterId))
        .sort((lg1, lg2) => lg1.name.localeCompare(lg2.name));
      this.isLoadingLogicalGroups = false;
    });
  }

  private loadProfiles(): void {
    const sourceClusterIds = new Set(this.vCenter.sourceClusterIds);

    this.isLoadingProfiles = true;
    this.agmProfileService.v1ActifioGmProfilesGet({ limit: 100, offset: 0 }).subscribe(profiles => {
      this.allProfiles = profiles
        .filter(p => sourceClusterIds.has(p.sourceClusterId))
        .reduce((profiles, profile) => {
          const { id, name, localClusterName, remoteClusterName } = profile;
          const localProfile: Profile = {
            id,
            name,
            displayName: `Local: ${localClusterName}`,
            clusterName: localClusterName,
            type: 'Local',
          };
          const remoteProfile: Profile = {
            id,
            name,
            displayName: `Remote: ${localClusterName}`,
            clusterName: remoteClusterName,
            type: 'Remote',
          };

          if (remoteClusterName) {
            return profiles.concat(localProfile, remoteProfile);
          }
          return profiles.concat(localProfile);
        }, [])
        .sort((p1, p2) => {
          const getIdentifier = profile => profile.name + profile.displayName;
          return getIdentifier(p1).localeCompare(getIdentifier(p2));
        });
      this.shownProfiles = [...this.allProfiles];
      this.isLoadingProfiles = false;
    });
  }

  private loadTemplates(): void {
    this.isLoadingTemplates = true;
    this.agmTemplateService.v1ActifioGmTemplatesGet().subscribe(data => {
      this.templates = data;
      this.isLoadingTemplates = false;
    });
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      actionType: [this.actions[0].type],
      templateId: [null, ValidatorUtil.optionallyRequired(() => this.form.get('actionType').value === 'sla')],
      profile: [null, ValidatorUtil.optionallyRequired(() => this.form.get('actionType').value === 'sla')],
      logicalGroupId: [null, ValidatorUtil.optionallyRequired(() => this.form.get('actionType').value === 'logical-group')],
    });

    this.form.get('profile').disable();
  }

  private handleAction(): Observable<any> {
    const { actionType } = this.form.value;

    if (actionType === 'sla') {
      const { profile, templateId } = this.form.value;
      return this.applySlas(templateId, profile);
    }

    if (actionType === 'logical-group') {
      return this.updateLogicalGroup(this.form.value.logicalGroupId);
    }

    return of({});
  }

  private updateLogicalGroup(logicalGroupId: string): Observable<ActifioDetailedLogicalGroupDto> {
    return this.agmLogicalGroupService.v1ActifioGmLogicalGroupsIdGet({ id: logicalGroupId }).pipe(
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

        return this.agmLogicalGroupService.v1ActifioGmLogicalGroupsIdPut({
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

  private applySlas(templateId: string, profile: Profile): Observable<any> {
    const createSla = (vm: ActifioApplicationDto) => {
      return this.agmSlaService.v1ActifioGmSlasPost({
        actifioCreateOrApplySlaDto: {
          applicationId: vm.id,
          applicationName: vm.name,
          apply: true,
          slpId: profile.id,
          sltId: templateId,
        },
      });
    };

    const slas = this.virtualMachines.map(vm => createSla(vm));
    return forkJoin(slas);
  }

  private subscribeToTemplateChanges(): Subscription {
    const profile = this.form.get('profile');

    return this.form.get('templateId').valueChanges.subscribe(templateId => {
      if (!!templateId) {
        profile.enable();

        const template = this.templates.find(t => t.id === templateId);

        const requiresRemoteProfile = template.policies.some(p => {
          return p.remoteRetention > 0 || p.operation === ActifioPolicyDtoOperation.Replicate;
        });

        this.shownProfiles = requiresRemoteProfile ? this.allProfiles.filter(p => p.type === 'Remote') : this.allProfiles;
      } else {
        this.shownProfiles = this.allProfiles;
        profile.disable();
        profile.setValue(null);
      }
    });
  }

  private reset(): void {
    this.submitted = false;
    this.form.reset();
    this.form.controls.actionType.setValue(this.actions[0].type);
  }
}
