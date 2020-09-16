import { DatePipe } from '@angular/common';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { V1AgmApplicationsService } from 'api_client/api/v1AgmApplications.service';
import { V1AgmJobsService } from 'api_client/api/v1AgmJobs.service';
import { ActifioApplicationDto } from 'api_client/model/actifioApplicationDto';
import { ActifioJobDto } from 'api_client/model/actifioJobDto';
import { Observable, of } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { TableConfig } from 'src/app/common/table/table.component';

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
export class VmListComponent implements OnInit {
  @ViewChild('lastSyncTemplate', { static: false }) lastSyncTemplate: TemplateRef<any>;
  @ViewChild('lastBackupTemplate', { static: false }) lastBackupTemplate: TemplateRef<any>;

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
        property: 'name',
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

  constructor(
    private agmApplicationService: V1AgmApplicationsService,
    private agmJobService: V1AgmJobsService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.loadVirtualMachines();
  }

  public loadVirtualMachines(): void {
    this.agmApplicationService.v1AgmApplicationsGet().subscribe((data: ActifioApplicationDto[]) => {
      this.virtualMachines = data.map(datum => {
        return {
          ...datum,
          lastBackupDate: this.getLastBackupDate(datum.name),
          lastSyncDate: this.getLastSyncDate(datum.name),
        };
      });
    });
  }

  public getLastSyncDate(virtualMachineName: string): Observable<string> {
    return this.getMostRecentSuccessfulJob(virtualMachineName, JobClassCode.DedupAsync);
  }

  public getLastBackupDate(virtualMachineName: string): Observable<string> {
    return this.getMostRecentSuccessfulJob(virtualMachineName, JobClassCode.Snapshot);
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
            return 'N/A';
          }
          return this.datePipe.transform(jobs[0].endDate, 'M/d/yy, h:mm:ss a');
        }),
      );
  }
}
