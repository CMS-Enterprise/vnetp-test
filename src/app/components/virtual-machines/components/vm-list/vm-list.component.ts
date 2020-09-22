import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { V1AgmApplicationsService } from 'api_client/api/v1AgmApplications.service';
import { V1AgmJobsService } from 'api_client/api/v1AgmJobs.service';
import { ActifioApplicationDto } from 'api_client/model/actifioApplicationDto';
import { ActifioJobDto } from 'api_client/model/actifioJobDto';
import { concat, Observable, Subscription } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { map, take } from 'rxjs/operators';
import { TableConfig } from 'src/app/common/table/table.component';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

enum JobClassCode {
  Snapshot = 1,
  DedupAsync = 18,
}

export interface VirtualMachineView extends ActifioApplicationDto {
  lastSyncDate: Observable<string>;
  lastBackupDate: Observable<string>;
}

@Component({
  selector: 'app-vm-list',
  templateUrl: './vm-list.component.html',
})
export class VmListComponent implements OnInit, OnDestroy {
  @ViewChild('nameTemplate', { static: false }) nameTemplate: TemplateRef<any>;
  @ViewChild('lastSyncTemplate', { static: false }) lastSyncTemplate: TemplateRef<any>;
  @ViewChild('lastBackupTemplate', { static: false }) lastBackupTemplate: TemplateRef<any>;

  public isLoading = false;
  public virtualMachines: VirtualMachineView[] = [];
  public config: TableConfig = {
    description: 'List of Virtual Machines',
    columns: [
      {
        name: 'Managed?',
        property: 'isManaged',
      },
      {
        name: 'Name',
        template: () => this.nameTemplate,
      },
      {
        name: 'Last Sync Date',
        template: () => this.lastSyncTemplate,
      },
      {
        name: 'Recent Available Backup',
        template: () => this.lastBackupTemplate,
      },
    ],
  };

  private virtualMachineSubscription: Subscription;

  constructor(
    private agmApplicationService: V1AgmApplicationsService,
    private agmJobService: V1AgmJobsService,
    private datePipe: DatePipe,
    private ngx: NgxSmartModalService,
  ) {}

  ngOnInit(): void {
    this.loadVirtualMachines();
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.virtualMachineSubscription]);
  }

  public discoverVirtualMachines(): void {
    this.ngx.getModal('vmDiscoveryModal').open();
  }

  public loadVirtualMachines(): void {
    this.virtualMachines = [];
    this.isLoading = true;
    this.virtualMachineSubscription = this.chunkVirtualMachines();
  }

  public getLastSyncDate(virtualMachineName: string): Observable<string> {
    return this.getMostRecentSuccessfulJob(virtualMachineName, JobClassCode.DedupAsync);
  }

  public getLastBackupDate(virtualMachineName: string): Observable<string> {
    return this.getMostRecentSuccessfulJob(virtualMachineName, JobClassCode.Snapshot);
  }

  private chunkVirtualMachines(chunkSize = 20): Subscription {
    const virtualMachineCount = 400;
    const virtualMachineChunks = Array(virtualMachineCount / chunkSize)
      .fill(null)
      .map((value: null, index: number) => {
        return this.agmApplicationService.v1AgmApplicationsGet({ limit: chunkSize, offset: index * chunkSize });
      });

    return concat(...virtualMachineChunks).subscribe((data: ActifioApplicationDto[] = []) => {
      const virtualMachines = data.map(datum => {
        return {
          ...datum,
          lastBackupDate: this.getLastBackupDate(datum.name),
          lastSyncDate: this.getLastSyncDate(datum.name),
        };
      });

      this.virtualMachines = [].concat(this.virtualMachines, virtualMachines);
      this.isLoading = false;
    });
  }

  private getMostRecentSuccessfulJob(virtualMachineName: string, jobClassCode: JobClassCode): Observable<string> {
    return this.agmJobService
      .v1AgmJobsGet({
        jobClassCode,
        limit: 10,
        offset: 0,
        applicationName: virtualMachineName,
        status: 'succeeded',
      })
      .pipe(
        take(1),
        map((jobs: ActifioJobDto[]) => {
          if (!jobs || jobs.length === 0) {
            return '--';
          }
          return this.datePipe.transform(jobs[0].endDate, 'M/d/yy, h:mm:ss a');
        }),
      );
  }
}
