import { Injectable } from '@angular/core';
import { Datacenter, V1TiersService } from '../../../client';
import { DatacenterContextService } from './datacenter-context.service';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UndeployedChangesService {
  currentDatacenter: Datacenter;

  private undeployedChangeObjectsSubject = new BehaviorSubject<any | null>(null);
  public undeployedChangeObjects: Observable<any | null> = this.undeployedChangeObjectsSubject.asObservable();

  private undeployedChangesSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public undeployedChanges: Observable<boolean> = this.undeployedChangesSubject.asObservable();

  constructor(private datacenterContextService: DatacenterContextService, private tierService: V1TiersService) {
    this.setupSubscriptions();
    // Get undeployed changes every 15 minutes
    setInterval(() => {
      this.getUndeployedChanges();
    }, 30 * 1000);
  }

  getUndeployedChanges() {
    // TODO: Determine if netcentric or appcentric
    this.getNetcentricChanges();
  }

  setupSubscriptions() {
    this.datacenterContextService.currentDatacenter.subscribe(datacenterContext => {
      this.currentDatacenter = datacenterContext;
      // Get undeployed changes on datacenter change.
      this.getUndeployedChanges();
    });
  }

  getNetcentricChanges(): void {
    if (!this.currentDatacenter) {
      return;
    }

    this.tierService
      .getManyTier({
        filter: [`datacenterId||eq||${this.currentDatacenter.id}`, 'version||gt_prop||provisionedVersion', 'deletedAt||isnull'],
        sort: ['updatedAt,DESC'],
        fields: ['id', 'name'],
        page: 1,
        perPage: 1000,
      })
      .subscribe(response => {
        this.undeployedChangeObjectsSubject.next(response.data);
        this.undeployedChangesSubject.next(response.data.length > 0);
      });
  }
}
