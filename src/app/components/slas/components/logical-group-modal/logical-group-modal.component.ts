import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ActifioAddOrUpdateLogicalGroupDto,
  ActifioApplicationDto,
  ActifioClusterDto,
  ActifioProfileDto,
  ActifioTemplateDto,
  V1ActifioGmApplicationsService,
  V1ActifioGmClustersService,
  V1ActifioGmLogicalGroupsService,
  V1ActifioGmProfilesService,
  V1ActifioGmTemplatesService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-logical-group-modal',
  templateUrl: './logical-group-modal.component.html',
})
export class LogicalGroupModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public modalTitle: string;
  public submitted = false;

  // Clusters
  public clusters: ActifioClusterDto[] = [];
  public isLoadingClusters = false;

  // Virtual Machines
  public virtualMachines: ActifioApplicationDto[] = [];
  public isLoadingVirtualMachines = false;

  // Templates
  public templates: ActifioTemplateDto[] = [];
  public isLoadingTemplates = false;

  // Profiles
  public profiles: ActifioProfileDto[] = [];
  public isLoadingProfiles = false;

  private logicalGroupId: string;
  private clusterChangeSubscription: Subscription;

  constructor(
    private agmApplicationService: V1ActifioGmApplicationsService,
    private agmClusterService: V1ActifioGmClustersService,
    private agmLogicalGroupService: V1ActifioGmLogicalGroupsService,
    private agmProfileService: V1ActifioGmProfilesService,
    private agmTemplateService: V1ActifioGmTemplatesService,
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();
  }

  ngOnDestroy(): void {
    this.reset();
    SubscriptionUtil.unsubscribe([this.clusterChangeSubscription]);
  }

  public loadLogicalGroup(): void {
    const logicalGroup = this.ngx.getModalData('logicalGroupModal');
    this.logicalGroupId = logicalGroup.id;

    const isNewLogicalGroup = !this.logicalGroupId;
    this.modalTitle = isNewLogicalGroup ? 'Create Logical Group' : 'Edit Logical Group';

    this.clusterChangeSubscription = this.form.controls.clusterId.valueChanges
      .pipe(
        tap(() => (this.isLoadingVirtualMachines = true)),
        switchMap((clusterId: string) => {
          if (!clusterId) {
            return of([]);
          }
          return this.loadVirtualMachinesOnCluster(clusterId);
        }),
      )
      .subscribe((virtualMachines: ActifioApplicationDto[]) => {
        this.virtualMachines = virtualMachines;
        this.isLoadingVirtualMachines = false;
      });

    this.loadLookups();
    this.loadLogicalGroupById(this.logicalGroupId);
  }

  public onClose(): void {
    this.ngx.getModal('logicalGroupModal').close();
    this.ngx.resetModalData('logicalGroupModal');
    this.reset();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const isNewLogicalGroup = !this.logicalGroupId;
    const { description, name, clusterId, templateId, profileId, virtualMachines } = this.form.value;
    const members = (virtualMachines || []).map(vm => {
      return {
        id: vm.id,
        applianceId: vm.applianceId,
      };
    });

    const dto: ActifioAddOrUpdateLogicalGroupDto = {
      description,
      members,
      name,
      profileId,
      templateId,
      applianceId: clusterId,
    };

    if (isNewLogicalGroup) {
      this.createLogicalGroup(dto);
    } else {
      this.updateLogicalGroup(this.logicalGroupId, dto);
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      clusterId: [null, Validators.required],
      description: '',
      name: ['', Validators.required],
      profileId: null,
      templateId: null,
      virtualMachines: null,
    });
  }

  private reset(): void {
    this.logicalGroupId = null;
    this.submitted = false;
    this.form.reset();
    this.form.enable();
  }

  private loadLookups(): void {
    this.loadClusters();
    this.loadProfiles();
    this.loadTemplates();
    this.loadLogicalGroupMembers(this.logicalGroupId);
  }

  private loadLogicalGroupMembers(logicalGroupId: string): void {
    if (!logicalGroupId) {
      return;
    }

    this.isLoadingVirtualMachines = true;
    this.agmLogicalGroupService
      .v1ActifioGmLogicalGroupsIdMembersGet({ id: logicalGroupId })
      .subscribe((members: ActifioApplicationDto[]) => {
        this.virtualMachines = members;
        this.isLoadingVirtualMachines = false;
      });
  }

  private loadTemplates(): void {
    this.isLoadingTemplates = true;
    this.agmTemplateService.v1ActifioGmTemplatesGet({}).subscribe(templates => {
      this.templates = templates;
      this.isLoadingTemplates = false;
    });
  }

  private loadProfiles(): void {
    this.isLoadingProfiles = true;
    this.agmProfileService.v1ActifioGmProfilesGet({}).subscribe(profiles => {
      this.profiles = profiles;
      this.isLoadingProfiles = false;
    });
  }

  private loadClusters(): void {
    this.isLoadingClusters = true;
    this.agmClusterService.v1ActifioGmClustersGet({}).subscribe(clusters => {
      this.clusters = clusters;
      this.isLoadingClusters = false;
    });
  }

  private loadVirtualMachinesOnCluster(clusterId: string): Observable<ActifioApplicationDto[]> {
    return this.agmApplicationService.v1ActifioGmApplicationsGet({
      logicalGroupMember: false,
      clusterIds: [clusterId],
    });
  }

  private createLogicalGroup(dto: ActifioAddOrUpdateLogicalGroupDto): void {
    this.agmLogicalGroupService
      .v1ActifioGmLogicalGroupsPost({
        actifioAddOrUpdateLogicalGroupDto: dto,
      })
      .subscribe(() => this.onClose());
  }

  private loadLogicalGroupById(logicalGroupId: string): void {
    if (!logicalGroupId) {
      return;
    }
    this.agmLogicalGroupService.v1ActifioGmLogicalGroupsIdGet({ id: logicalGroupId }).subscribe(detailedLogicalGroup => {
      const { logicalGroup, members } = detailedLogicalGroup;
      const { name, description, applianceId, sla } = logicalGroup;

      this.form.controls.name.setValue(name);
      this.form.controls.name.disable();
      this.form.controls.clusterId.setValue(applianceId);
      this.form.controls.clusterId.disable();

      this.form.controls.description.setValue(description);
      this.form.controls.templateId.setValue(sla ? sla.template.id : null);
      this.form.controls.profileId.setValue(sla ? sla.profile.id : null);
      this.form.controls.virtualMachines.setValue(members);
    });
  }

  private updateLogicalGroup(logicalGroupId: string, dto: ActifioAddOrUpdateLogicalGroupDto): void {
    this.agmLogicalGroupService
      .v1ActifioGmLogicalGroupsIdPut({
        id: logicalGroupId,
        actifioAddOrUpdateLogicalGroupDto: dto,
      })
      .subscribe(() => this.onClose());
  }
}
