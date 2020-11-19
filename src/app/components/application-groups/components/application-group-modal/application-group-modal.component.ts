import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ActifioCollectorApplianceDto,
  ActifioCollectorVirtualManagementServerDto,
  V1ActifioAppliancesService,
  V1ActifioApplicationGroupsService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

@Component({
  selector: 'app-application-group-modal',
  templateUrl: './application-group-modal.component.html',
  styleUrls: ['./application-group-modal.component.scss'],
})
export class ApplicationGroupModalComponent implements OnInit, OnDestroy {
  public form: FormGroup;
  public modalTitle: string;
  public submitted = false;

  // Lookups
  public appliances: ActifioCollectorApplianceDto[] = [];
  public isLoadingAppliances = false;
  public virtualManagementServers: ActifioCollectorVirtualManagementServerDto[] = [];
  public isLoadingVirtualManagementServers = false;
  public virtualMachines: any[] = [];
  public isLoadingVirtualMachines = false;

  private applicationGroupId: string;

  // Subscriptions
  private applianceChanges: Subscription;
  private nameChanges: Subscription;
  private virtualManagementServerChanges: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private rdcApplicationGroupService: V1ActifioApplicationGroupsService,
    private rdcApplianceService: V1ActifioAppliancesService,
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.initForm();
    this.loadAppliances();
  }

  ngOnDestroy(): void {
    this.reset();
    SubscriptionUtil.unsubscribe([this.applianceChanges, this.nameChanges, this.virtualManagementServerChanges]);
  }

  public loadApplicationGroup(): void {
    const applicationGroup = this.ngx.getModalData('applicationGroupModal');
    this.applicationGroupId = applicationGroup.id;

    this.applianceChanges = this.subscribeToApplianceChanges();
    this.nameChanges = this.subscribeToNameChanges();
    this.virtualManagementServerChanges = this.subscribeToVirtualManagementServerChanges();

    const isNewApplicationGroup = !this.applicationGroupId;
    this.modalTitle = isNewApplicationGroup ? 'Create Application Group' : 'Edit Application Group';

    this.loadApplicationGroupById(this.applicationGroupId);
  }

  public onClose(): void {
    this.ngx.getModal('applicationGroupModal').close();
    this.ngx.resetModalData('applicationGroupModal');
    this.reset();
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const isNewApplicationGroup = !this.applicationGroupId;
    const { name } = this.form.value;

    // TODO: Add types on back-end
    const dto: any = {
      name,
    };

    if (isNewApplicationGroup) {
      this.createApplicationGroup(dto);
    } else {
      this.updateApplicationGroup(this.applicationGroupId, dto);
    }
  }

  private initForm(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      description: [''],
      applianceId: ['', Validators.required],
      virtualManagementServerId: ['', Validators.required],
      virtualMachineIds: [null, Validators.required],
    });

    this.form.controls.applianceId.disable();
    this.form.controls.virtualManagementServerId.disable();
    this.form.controls.virtualMachineIds.disable();
  }

  private reset(): void {
    this.applicationGroupId = null;
    this.submitted = false;
    this.form.reset();
    this.form.enable();
  }

  private subscribeToNameChanges(): Subscription {
    return this.form.controls.name.valueChanges.subscribe((name: string) => {
      const fn: keyof AbstractControl = name ? 'enable' : 'disable';
      this.form.controls.applianceId[fn]();
    });
  }

  private subscribeToApplianceChanges(): Subscription {
    return this.form.controls.applianceId.valueChanges
      .pipe(
        tap(applianceId => {
          const fn: keyof AbstractControl = applianceId ? 'enable' : 'disable';
          this.form.controls.virtualManagementServerId[fn]();
          this.isLoadingVirtualManagementServers = true;
        }),
        switchMap(applianceId => {
          if (!applianceId) {
            return of([]);
          }
          return this.loadVirtualManagementServers(applianceId);
        }),
      )
      .subscribe(virtualManagementServers => {
        this.form.controls.virtualManagementServerId.setValue(null);
        this.virtualManagementServers = virtualManagementServers;
        this.isLoadingVirtualManagementServers = false;
      });
  }

  private subscribeToVirtualManagementServerChanges(): Subscription {
    return this.form.controls.virtualManagementServerId.valueChanges
      .pipe(
        switchMap((virtualManagementServerId: string) => {
          const { applianceId } = this.form.value;
          if (!applianceId || !virtualManagementServerId) {
            return of([]);
          }
          return this.loadVirtualMachines(virtualManagementServerId);
        }),
      )
      .subscribe((virtualMachines: VirtualMachine[]) => {
        this.virtualMachines = virtualMachines;
        this.form.controls.virtualMachineIds.setValue(null);
      });
  }

  private loadAppliances(): void {
    this.isLoadingAppliances = true;
    this.rdcApplianceService.v1ActifioAppliancesGet().subscribe(appliances => {
      this.appliances = appliances;
      this.isLoadingAppliances = false;
    });
  }

  private loadVirtualMachines(virtualMachineServerId: string): Observable<any[]> {
    return of([
      { id: '1', name: '1' },
      { id: '2', name: '2' },
    ]);
  }

  // TODO: Add types on back-end
  private createApplicationGroup(dto: any): void {
    this.rdcApplicationGroupService.v1ActifioApplicationGroupsPost().subscribe(() => this.onClose());
  }

  private loadApplicationGroupById(applicationGroupId: string): void {
    if (!applicationGroupId) {
      return;
    }
    this.rdcApplicationGroupService.v1ActifioApplicationGroupsIdGet({ id: applicationGroupId }).subscribe(applicationGroup => {
      const { name, description } = applicationGroup as any;

      this.form.controls.name.setValue(name);
      this.form.controls.name.disable();

      this.form.controls.description.setValue(description);
    });
  }

  private loadVirtualManagementServers(applianceId: string): Observable<ActifioCollectorVirtualManagementServerDto[]> {
    return this.rdcApplianceService.v1ActifioAppliancesIdVirtualManagementServersGet({ id: applianceId });
  }

  // TODO: Add types on back-end, implement PUT on back-end
  private updateApplicationGroup(applicationGroupId: string, dto: any): void {}
}

interface VirtualMachine {
  id: string;
  name: string;
  isSelected: boolean;
}
