import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  ActifioRdsArmServerDto,
  V1ActifioRdsArmServersService,
  ActifioApplicationGroupDto,
  V1ActifioRdsVirtualManagementServersService,
  ActifioRdsVirtualManagementServerDto,
  ActifioRdsResourcePoolDto,
  ActifioRdsAddRecoveryPlanDto,
  ActifioPortGroupDto,
  V1ActifioRdsRecoveryPlansService,
  ActifioRdsRecoveryPlanDto,
} from 'client';
import { Observable, Subscription, of, forkJoin } from 'rxjs';
import { FormBuilder, FormGroup, AbstractControl, Validators } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { tap, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-recovery-plan-modal',
  templateUrl: './recovery-plan-modal.component.html',
  styleUrls: ['./recovery-plan-modal.component.scss'],
})
export class RecoveryPlanModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public modalTitle: string;

  // Application Group Data
  public availableApplicationGroups: ActifioApplicationGroupDto[] = [];
  public selectedApplicationGroups: ActifioApplicationGroupDto[] = [];

  // Form Data
  public recoveryPlanId: string;
  public armServers: ActifioRdsArmServerDto[];
  public virtualManagementServers: ActifioRdsVirtualManagementServerDto[];
  public resourcePools: ActifioRdsResourcePoolDto[];
  public portGroups: ActifioPortGroupDto[];

  // Subscriptions
  private nameChanges: Subscription;
  private armServerChanges: Subscription;
  private virtualManagementServerChanges: Subscription;
  private resourcePoolChanges: Subscription;

  // Booleans
  public isLoadingArmServers: boolean;
  public isLoadingApplicationGroups: boolean;
  public isLoadingVirtualManagementServers: boolean;
  public isLoadingResourcePools: boolean;
  public isLoadingPortGroups: boolean;
  public submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private rdsArmServerService: V1ActifioRdsArmServersService,
    private rdsVirtualManagementService: V1ActifioRdsVirtualManagementServersService,
    private rdsRecoveryPlanService: V1ActifioRdsRecoveryPlansService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadArmServers();
  }

  ngOnDestroy(): void {
    this.reset();
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      armServerId: ['', Validators.required],
      virtualManagementServerId: ['', Validators.required],
      resourcePoolId: ['', Validators.required],
      portGroupName: ['', Validators.required],
    });
    this.form.controls.armServerId.disable();
    this.form.controls.virtualManagementServerId.disable();
    this.form.controls.resourcePoolId.disable();
    this.form.controls.portGroupName.disable();
  }

  public onClose(): void {
    this.ngx.resetModalData('recoveryPlanModal');
    this.ngx.getModal('recoveryPlanModal').close();
    this.reset();
  }

  private reset(): void {
    this.recoveryPlanId = null;
    this.availableApplicationGroups = [];
    this.selectedApplicationGroups = [];
    this.virtualManagementServers = [];
    this.form.controls.virtualManagementServerId.disable();
    this.submitted = false;
    this.form.reset();
    SubscriptionUtil.unsubscribe([this.nameChanges, this.armServerChanges, this.virtualManagementServerChanges, this.resourcePoolChanges]);
  }

  private loadArmServers(): void {
    this.rdsArmServerService.getArmServersArmServer().subscribe(armServers => {
      this.armServers = armServers;
      this.isLoadingArmServers = false;
    });
  }

  private loadAvailableApplicationGroups(armServerId: string): Observable<ActifioApplicationGroupDto[]> {
    return this.rdsArmServerService.getApplicationGroupsArmServer({ id: armServerId });
  }

  private loadVirtualManagementServers(armServerId: string, applicationGroupIds?: string[]): void {
    this.rdsVirtualManagementService
      .getVirtualManagementServersVirtualManagement({ armServerId, applicationGroupIds })
      .subscribe(virtualManagementServers => {
        this.virtualManagementServers = virtualManagementServers;
        this.isLoadingVirtualManagementServers = false;
      });
  }

  private loadResourcePools(virtualManagementServerId: string): Observable<ActifioRdsResourcePoolDto[]> {
    return this.rdsVirtualManagementService.getResourcePoolsVirtualManagement({ id: virtualManagementServerId });
  }

  private loadPortGroups(virtualManagementServerId: string, resourcePoolId: string): Observable<ActifioPortGroupDto[]> {
    return this.rdsVirtualManagementService.getPortGroupsVirtualManagement({
      id: virtualManagementServerId,
      resourcePoolId,
    });
  }

  private editRecoveryPlan(id: string, dto: ActifioRdsAddRecoveryPlanDto): void {
    this.rdsRecoveryPlanService.updateRecoveryPlanRecoveryPlan({ id, actifioRdsAddRecoveryPlanDto: dto }).subscribe(() => this.onClose());
  }

  private createRecoveryPlan(dto: ActifioRdsAddRecoveryPlanDto): void {
    this.rdsRecoveryPlanService.createRecoveryPlanRecoveryPlan({ actifioRdsAddRecoveryPlanDto: dto }).subscribe(() => this.onClose());
  }

  private subscribeToNameChanges(): Subscription {
    return this.form.controls.name.valueChanges.subscribe((name: string) => {
      const fn: keyof AbstractControl = name ? 'enable' : 'disable';
      this.form.controls.armServerId[fn]();
    });
  }

  private subscribeToArmServerChanges(): Subscription {
    return this.form.controls.armServerId.valueChanges
      .pipe(
        tap(() => (this.isLoadingApplicationGroups = true)),
        switchMap((armServerId: string) => {
          if (!armServerId) {
            return of([]);
          }
          return this.loadAvailableApplicationGroups(armServerId);
        }),
      )
      .subscribe((applicationGroups: ActifioApplicationGroupDto[]) => {
        this.form.controls.virtualManagementServerId.setValue(null);
        this.availableApplicationGroups = applicationGroups;
        this.isLoadingApplicationGroups = false;
      });
  }

  private subscribeToVirtualManagementServerChanges(): Subscription {
    return this.form.controls.virtualManagementServerId.valueChanges
      .pipe(
        tap(virtualManagementServerId => {
          const fn: keyof AbstractControl = virtualManagementServerId ? 'enable' : 'disable';
          this.form.controls.resourcePoolId[fn]();
          this.isLoadingResourcePools = true;
        }),
        switchMap(virtualManagementServerId => {
          if (!virtualManagementServerId) {
            return of([]);
          }
          return this.loadResourcePools(virtualManagementServerId);
        }),
      )
      .subscribe((resourcePools: ActifioRdsResourcePoolDto[]) => {
        this.form.controls.resourcePoolId.setValue(null);
        this.resourcePools = resourcePools;
        this.isLoadingResourcePools = false;
      });
  }

  private subscribeToResourcePoolChanges(): Subscription {
    return this.form.controls.resourcePoolId.valueChanges
      .pipe(
        tap(resourcePoolId => {
          const fn: keyof AbstractControl = resourcePoolId ? 'enable' : 'disable';
          this.form.controls.portGroupName[fn]();
          this.isLoadingPortGroups = true;
        }),
        switchMap(resourcePoolId => {
          if (!resourcePoolId) {
            return of([]);
          }
          const { virtualManagementServerId } = this.form.value;
          return this.loadPortGroups(virtualManagementServerId, resourcePoolId);
        }),
      )
      .subscribe((portGroups: ActifioPortGroupDto[]) => {
        this.form.controls.portGroupName.setValue(null);
        this.portGroups = portGroups;
        this.isLoadingPortGroups = false;
      });
  }

  public loadRecoveryPlan(): void {
    const recoveryPlan = this.ngx.getModalData('recoveryPlanModal');
    this.recoveryPlanId = recoveryPlan.id;
    const isNewRecoveryPlan = !this.recoveryPlanId;

    if (isNewRecoveryPlan) {
      this.nameChanges = this.subscribeToNameChanges();
      this.armServerChanges = this.subscribeToArmServerChanges();
      this.virtualManagementServerChanges = this.subscribeToVirtualManagementServerChanges();
      this.resourcePoolChanges = this.subscribeToResourcePoolChanges();
    } else {
      this.loadRecoveryPlanById(recoveryPlan.recPlanMatch);
    }
    this.modalTitle = isNewRecoveryPlan ? 'Create Recovery Plan' : 'Edit Recovery Plan';
  }

  private loadRecoveryPlanById(recoveryPlan: ActifioRdsRecoveryPlanDto): void {
    const { armServerId, applicationGroups, defaultResourcePoolId, defaultPortGroupUniqueName, name, serverId } = recoveryPlan;
    this.selectedApplicationGroups = applicationGroups;
    const selectedApplicationGroupIds = this.selectedApplicationGroups.map(appGroup => appGroup.id);

    const availableApplicationGroups$ = this.loadAvailableApplicationGroups(armServerId);
    const resourcePools$ = this.loadResourcePools(serverId);
    const portGroups$ = this.loadPortGroups(serverId, defaultResourcePoolId);

    forkJoin([availableApplicationGroups$, resourcePools$, portGroups$]).subscribe(resp => {
      const [availableApplicationGroups, resourcePools, portGroups] = resp;
      this.resourcePools = resourcePools;
      this.portGroups = portGroups;
      this.availableApplicationGroups = availableApplicationGroups;
      const setField = (prop: string, value: any, disable = false) => {
        const field = this.form.controls[prop];
        field.setValue(value);
        field.updateValueAndValidity();
        if (disable) {
          field.disable();
        }
      };

      setField('armServerId', armServerId, true);
      setField('resourcePoolId', defaultResourcePoolId, true);
      setField('portGroupName', defaultPortGroupUniqueName, true);
      setField('name', name);
      setField('virtualManagementServerId', +serverId, true);
      this.loadVirtualManagementServers(armServerId, selectedApplicationGroupIds);
    });
  }

  public addApplicationGroup(applicationGroup: ActifioApplicationGroupDto): void {
    this.selectedApplicationGroups.push(applicationGroup);
    const selectedApplicationGroupIds = this.selectedApplicationGroups.map(appGroup => appGroup.id);
    this.availableApplicationGroups = this.availableApplicationGroups.filter(appGroup => appGroup.id !== applicationGroup.id);

    const fn: keyof AbstractControl = this.selectedApplicationGroups.length === 0 ? 'disable' : 'enable';
    this.form.controls.virtualManagementServerId[fn]();

    const armServerId = this.form.controls.armServerId.value;
    this.loadVirtualManagementServers(armServerId, selectedApplicationGroupIds);
  }

  public removeApplicationGroup(applicationGroup: ActifioApplicationGroupDto): void {
    this.availableApplicationGroups.push(applicationGroup);
    this.selectedApplicationGroups = this.selectedApplicationGroups.filter(appGroup => appGroup.id !== applicationGroup.id);

    if (this.selectedApplicationGroups.length === 0) {
      this.virtualManagementServers = [];
      this.form.controls.virtualManagementServerId.setValue(null);
      const fn: keyof AbstractControl = this.selectedApplicationGroups.length === 0 ? 'disable' : 'enable';
      this.form.controls.virtualManagementServerId[fn]();
    } else {
      const selectedApplicationGroupIds = this.selectedApplicationGroups.map(appGroup => appGroup.id);
      const armServerId = this.form.controls.armServerId.value;
      this.loadVirtualManagementServers(armServerId, selectedApplicationGroupIds);
    }
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const isNewRecoveryPlan = !this.recoveryPlanId;

    const dto: ActifioRdsAddRecoveryPlanDto = {
      applicationGroupIds: this.selectedApplicationGroups.map(appGroup => appGroup.id),
      name: this.f.name.value,
      armServerId: this.f.armServerId.value,
      serverId: this.f.virtualManagementServerId.value,
      defaultResourcePoolId: this.f.resourcePoolId.value,
      defaultPortGroupUniqueName: this.f.portGroupName.value,
    };

    if (isNewRecoveryPlan) {
      this.createRecoveryPlan(dto);
    } else {
      this.editRecoveryPlan(this.recoveryPlanId, dto);
    }
  }
}
