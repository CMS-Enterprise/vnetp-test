import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { ActifioDetailedApplicationDto } from 'api_client';
import { V1AgmApplicationsService } from 'api_client/api/v1AgmApplications.service';
import { V1AgmJobsService } from 'api_client/api/v1AgmJobs.service';
import { ActifioApplicationDto } from 'api_client/model/actifioApplicationDto';
import { ActifioJobDto } from 'api_client/model/actifioJobDto';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith, switchMap, take } from 'rxjs/operators';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';

enum JobClassCode {
  Snapshot = 1,
  DedupAsync = 18,
}

@Component({
  selector: 'app-vm-view',
  templateUrl: './vm-view.component.html',
})
export class VmViewComponent implements OnInit, OnDestroy {
  public virtualMachine: ActifioApplicationDto;
  public lastSyncDate: Observable<string>;
  public lastBackupDate: Observable<string>;

  private virtualMachineSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private agmApplicationService: V1AgmApplicationsService,
    private agmJobService: V1AgmJobsService,
    private datePipe: DatePipe,
  ) {}

  ngOnInit(): void {
    this.virtualMachineSubscription = this.activatedRoute.paramMap
      .pipe(
        map((params: ParamMap) => params.get('id')),
        switchMap((virtualMachineId: string) => this.loadVirtualMachine(virtualMachineId)),
      )
      .subscribe((data: ActifioDetailedApplicationDto) => {
        const { application } = data;
        this.lastBackupDate = this.getLastBackupDate(application.name);
        this.lastSyncDate = this.getLastSyncDate(application.name);
        this.virtualMachine = application;
      });
  }

  ngOnDestroy(): void {
    SubscriptionUtil.unsubscribe([this.virtualMachineSubscription]);
  }

  private getLastSyncDate(virtualMachineName: string): Observable<string> {
    return this.getMostRecentSuccessfulJob(virtualMachineName, JobClassCode.DedupAsync);
  }

  private getLastBackupDate(virtualMachineName: string): Observable<string> {
    return this.getMostRecentSuccessfulJob(virtualMachineName, JobClassCode.Snapshot);
  }

  private loadVirtualMachine(virtualMachineId: string): Observable<any> {
    return this.agmApplicationService.v1AgmApplicationsIdGet({ id: virtualMachineId });
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
        startWith([]),
        take(2),
        map((jobs: ActifioJobDto[]) => {
          if (!jobs || jobs.length === 0) {
            return '--';
          }
          return this.datePipe.transform(jobs[0].endDate, 'M/d/yy, h:mm:ss a');
        }),
      );
  }
}
