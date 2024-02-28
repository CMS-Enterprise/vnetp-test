import { Injectable } from '@angular/core';
import {
  ServiceObject,
  Tier,
  V1NetworkSecurityNetworkObjectGroupsService,
  V1NetworkSecurityNetworkObjectsService,
  V1NetworkSecurityServiceObjectGroupsService,
  V1NetworkSecurityServiceObjectsService,
} from '../../../client';
import { TierContextService } from './tier-context.service';
import { BehaviorSubject, Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UndeployedChangesService {
  currentTier: Tier;

  private undeployedChangeObjectsSubject = new BehaviorSubject<any | null>(null);
  public undeployedChangeObjects: Observable<any | null> = this.undeployedChangeObjectsSubject.asObservable();

  private undeployedChangesSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  public undeployedChanges: Observable<boolean> = this.undeployedChangesSubject.asObservable();

  constructor(
    private networkObjectService: V1NetworkSecurityNetworkObjectsService,
    private networkObjectGroupService: V1NetworkSecurityNetworkObjectGroupsService,
    private serviceObjectService: V1NetworkSecurityServiceObjectsService,
    private serviceObjectGroupService: V1NetworkSecurityServiceObjectGroupsService,
    private tierContextService: TierContextService,
  ) {
    this.setupSubscriptions();
    // Get undeployed changes every 15 minutes
    setInterval(() => {
      this.getUndeployedChanges();
    }, 900000);
  }

  getUndeployedChanges() {
    // TODO: Determine if netcentric or appcentric
    this.getNetcentricChanges();
  }

  setupSubscriptions() {
    this.tierContextService.currentTier.subscribe(tierContext => {
      this.currentTier = tierContext;
      // Get undeployed changes on tier change.
      this.getUndeployedChanges();
    });
  }

  getNetcentricChanges(): void {
    if (!this.currentTier) {
      return;
    }

    const networkObjectRequest = this.networkObjectService.getManyNetworkObject({
      filter: [`tierId||eq||${this.currentTier.id}`, 'version||gt_prop||provisionedVersion'],
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name'],
      page: 1,
      perPage: 1,
    });
    const networkObjectGroupRequest = this.networkObjectGroupService.getManyNetworkObjectGroup({
      filter: [`tierId||eq||${this.currentTier.id}`, 'version||gt_prop||provisionedVersion'],
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name'],
      page: 1,
      perPage: 1,
    });
    const serviceObjectRequest = this.serviceObjectService.getManyServiceObject({
      filter: [`tierId||eq||${this.currentTier.id}`, 'version||gt_prop||provisionedVersion'],
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name'],
      page: 1,
      perPage: 1,
    });
    const serviceObjectGroupRequest = this.serviceObjectGroupService.getManyServiceObjectGroup({
      filter: [`tierId||eq||${this.currentTier.id}`, 'version||gt_prop||provisionedVersion'],
      sort: ['updatedAt,DESC'],
      fields: ['id', 'name'],
      page: 1,
      perPage: 1,
    });

    forkJoin([networkObjectRequest, networkObjectGroupRequest, serviceObjectRequest, serviceObjectGroupRequest]).subscribe(result => {
      const undeployedNetworkObjects = result[0].data;
      const undeployedNetworkObjectGroups = result[1].data;
      const undeployedServiceObjects = result[2].data;
      const undeployedServiceObjectGroups = result[3].data; // Corrected variable name for consistency

      // Emit the detailed undeployed objects
      this.undeployedChangeObjectsSubject.next({
        undeployedNetworkObjects,
        undeployedNetworkObjectGroups,
        undeployedServiceObjects,
        undeployedServiceObjectGroups,
      });

      // Check if any of the results have data and update undeployedChangesSubject accordingly
      const hasUndeployedChanges =
        undeployedNetworkObjects.length > 0 ||
        undeployedNetworkObjectGroups.length > 0 ||
        undeployedServiceObjects.length > 0 ||
        undeployedServiceObjectGroups.length > 0;

      this.undeployedChangesSubject.next(hasUndeployedChanges);
    });
  }
}
