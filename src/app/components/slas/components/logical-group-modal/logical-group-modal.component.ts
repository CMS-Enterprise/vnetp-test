import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ActifioAddOrUpdateLogicalGroupDto,
  ActifioApplicationDto,
  ActifioClusterDto,
  ActifioProfileDto,
  ActifioTemplateDto,
  V1AgmApplicationsService,
  V1AgmClustersService,
  V1AgmLogicalGroupsService,
  V1AgmProfilesService,
  V1AgmTemplatesService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

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

  constructor(
    private applicationService: V1AgmApplicationsService,
    private clusterService: V1AgmClustersService,
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
    this.initForm();
  }

  ngOnDestroy(): void {
    this.reset();
  }

  public loadLogicalGroup(): void {
    const logicalGroup = this.ngx.getModalData('logicalGroupModal');
    this.logicalGroupId = logicalGroup.id;

    const isNewLogicalGroup = !this.logicalGroupId;
    this.modalTitle = isNewLogicalGroup ? 'Create Logical Group' : 'Edit Logical Group';

    this.loadLookups(isNewLogicalGroup);
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

    if (isNewLogicalGroup) {
      this.createLogicalGroup({
        name,
        description,
        templateId,
        profileId,
        applianceId: clusterId,
        members: (virtualMachines || []).map(vm => {
          return {
            id: vm.id,
            applianceId: vm.applianceId,
          };
        }),
      });
    } else {
      this.updateLogicalGroup();
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
  }

  private loadApplications(): void {
    this.isLoadingVirtualMachines = true;
    this.applicationService.v1AgmApplicationsGet({ limit: 400, offset: 0 }).subscribe(applications => {
      this.virtualMachines = applications;
      this.isLoadingVirtualMachines = false;
    });
  }

  private loadLookups(isNewLogicalGroup: boolean): void {
    this.loadClusters();
    this.loadProfiles();
    this.loadTemplates();

    if (isNewLogicalGroup) {
      this.loadApplications();
    } else {
      this.loadLogicalGroupMembers(this.logicalGroupId);
    }
  }

  private loadLogicalGroupMembers(logicalGroupId: string): void {
    this.isLoadingVirtualMachines = true;
    this.logicalGroupService.v1AgmLogicalGroupsIdMembersGet({ id: logicalGroupId }).subscribe(members => {
      this.virtualMachines = members;
      this.isLoadingVirtualMachines = false;
    });
  }

  private loadTemplates(): void {
    this.isLoadingTemplates = true;
    this.templateService.v1AgmTemplatesGet().subscribe(templates => {
      this.templates = templates;
      this.isLoadingTemplates = false;
    });
  }

  private loadProfiles(): void {
    this.isLoadingProfiles = true;
    this.profileService.v1AgmProfilesGet({ limit: 100, offset: 0 }).subscribe(profiles => {
      this.profiles = profiles;
      this.isLoadingProfiles = false;
    });
  }

  private loadClusters(): void {
    this.isLoadingClusters = true;
    this.clusterService.v1AgmClustersGet({ limit: 100, offset: 0 }).subscribe(clusters => {
      this.clusters = clusters;
      this.isLoadingClusters = false;
    });
  }

  private createLogicalGroup(dto: ActifioAddOrUpdateLogicalGroupDto): void {
    this.logicalGroupService
      .v1AgmLogicalGroupsPost({
        actifioAddOrUpdateLogicalGroupDto: dto,
      })
      .subscribe(() => this.onClose());
  }

  private updateLogicalGroup(): void {}
}
