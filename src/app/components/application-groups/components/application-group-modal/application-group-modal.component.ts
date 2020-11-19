import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  ActifioApplicationGroupDto,
  ActifioCollectorApplianceDto,
  ActifioCollectorVirtualManagementServerDto,
  ActifioSequenceOrderDto,
  ActifioVMMemberDto,
  V1ActifioAppliancesService,
  V1ActifioApplicationGroupsService,
  V1ActifioApplicationsService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Observable, of, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

class SequenceOrder {
  public id: number;

  constructor(public order: number, public delay = 0, public virtualMachines: ActifioVMMemberDto[] = []) {
    this.id = order;
  }
}

type CreateApplicationGroupDto = Pick<ActifioApplicationGroupDto, 'description' | 'name' | 'serverId' | 'cdsId' | 'sequenceOrders'>;

@Component({
  selector: 'app-application-group-modal',
  templateUrl: './application-group-modal.component.html',
  styleUrls: ['./application-group-modal.component.scss'],
})
export class ApplicationGroupModalComponent implements OnInit, OnDestroy {
  public selectedSequenceOrderId: number;
  public form: FormGroup;
  public modalTitle: string;
  public submitted = false;
  public sequenceOrders: SequenceOrder[] = [];

  public appliances: ActifioCollectorApplianceDto[] = [];
  public isLoadingAppliances = false;

  public virtualManagementServers: ActifioCollectorVirtualManagementServerDto[] = [];
  public isLoadingVirtualManagementServers = false;

  public allVirtualMachines: ActifioVMMemberDto[] = [];
  public virtualMachines: ActifioVMMemberDto[] = [];
  public isLoadingVirtualMachines = false;

  private applicationGroupId: string;

  // Subscriptions
  private applianceChanges: Subscription;
  private nameChanges: Subscription;
  private virtualManagementServerChanges: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private ngx: NgxSmartModalService,
    private rdcApplianceService: V1ActifioAppliancesService,
    private rdcApplicationGroupService: V1ActifioApplicationGroupsService,
    private rdcApplicationService: V1ActifioApplicationsService,
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

  public addVirtualMachine(virtualMachine: ActifioVMMemberDto): void {
    const sequenceOrder = this.sequenceOrders.find(so => so.id === this.selectedSequenceOrderId);
    if (!sequenceOrder) {
      return;
    }
    sequenceOrder.virtualMachines = [].concat(sequenceOrder.virtualMachines, virtualMachine);
    this.virtualMachines = this.virtualMachines.filter(vm => vm.id !== virtualMachine.id);
  }

  public removeVirtualMachine(virtualMachineId: string, sequenceOrderId: number): void {
    const sequenceOrder = this.sequenceOrders.find(so => so.id === sequenceOrderId);
    if (!sequenceOrder) {
      return;
    }
    const virtualMachine = this.allVirtualMachines.find(vm => vm.id === virtualMachineId);
    this.virtualMachines.push(virtualMachine);
    sequenceOrder.virtualMachines = sequenceOrder.virtualMachines.filter(vm => vm.id !== virtualMachineId);
  }

  public loadApplicationGroup(): void {
    const applicationGroup = this.ngx.getModalData('applicationGroupModal');
    this.applicationGroupId = applicationGroup.id;

    this.applianceChanges = this.subscribeToApplianceChanges();
    this.nameChanges = this.subscribeToNameChanges();
    this.virtualManagementServerChanges = this.subscribeToVirtualManagementServerChanges();

    const isNewApplicationGroup = !this.applicationGroupId;
    this.modalTitle = isNewApplicationGroup ? 'Create Application Group' : 'Edit Application Group';

    if (isNewApplicationGroup) {
      this.addSequenceOrder();
    }

    this.loadApplicationGroupById(this.applicationGroupId);
  }

  public onClose(): void {
    this.ngx.getModal('applicationGroupModal').close();
    this.ngx.resetModalData('applicationGroupModal');
    this.reset();
  }

  public addSequenceOrder(): void {
    const order = this.sequenceOrders.length + 1;
    this.sequenceOrders = [].concat(this.sequenceOrders, new SequenceOrder(order));
    this.selectedSequenceOrderId = this.sequenceOrders[order - 1].id;
  }

  public save(): void {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }

    const isNewApplicationGroup = !this.applicationGroupId;
    const { name, description, applianceId: cdsId, virtualManagementServerId: serverId } = this.form.value;

    const dto: CreateApplicationGroupDto = {
      name,
      description,
      cdsId,
      serverId,
      sequenceOrders: this.sequenceOrders.map(this.mapSequenceOrder),
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
    });

    this.form.controls.applianceId.disable();
    this.form.controls.virtualManagementServerId.disable();
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
        tap(() => (this.isLoadingVirtualMachines = true)),
        switchMap((virtualManagementServerId: string) => {
          const { applianceId } = this.form.value;
          if (!applianceId || !virtualManagementServerId) {
            return of([]);
          }
          return this.loadVirtualMachines(applianceId, virtualManagementServerId);
        }),
      )
      .subscribe((virtualMachines: ActifioVMMemberDto[]) => {
        this.virtualMachines = virtualMachines;
        this.allVirtualMachines = virtualMachines;
        this.sequenceOrders = [new SequenceOrder(1)];

        this.isLoadingVirtualMachines = false;
      });
  }

  private loadAppliances(): void {
    this.isLoadingAppliances = true;
    this.rdcApplianceService.v1ActifioAppliancesGet().subscribe(appliances => {
      this.appliances = appliances;
      this.isLoadingAppliances = false;
    });
  }

  private loadVirtualMachines(applianceId: string, virtualMachineServerId: string): Observable<ActifioVMMemberDto[]> {
    return this.rdcApplicationService.v1ActifioApplicationsCdsIdServerIdGet({ cdsId: applianceId, serverId: virtualMachineServerId });
  }

  private createApplicationGroup(dto: CreateApplicationGroupDto): void {
    this.rdcApplicationGroupService
      .v1ActifioApplicationGroupsPost({
        actifioApplicationGroupDto: dto,
      })
      .subscribe(() => this.onClose());
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

  private mapSequenceOrder(sequenceOrder: SequenceOrder): ActifioSequenceOrderDto {
    return {
      delay: sequenceOrder.delay,
      memberOrderIndex: sequenceOrder.order,
      sequencePortGroup: [],
      vmMembers: sequenceOrder.virtualMachines,
    };
  }

  // TODO: Add types on back-end, implement PUT on back-end
  private updateApplicationGroup(applicationGroupId: string, dto: any): void {}
}
