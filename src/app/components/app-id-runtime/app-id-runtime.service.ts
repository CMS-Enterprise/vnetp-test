import { Injectable } from '@angular/core';
import { FirewallRule, PanosApplication, V1RuntimeDataAppIdRuntimeService } from '../../../../client';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppIdRuntimeService {
  public environment = environment;
  public appIdEnabled: boolean = this.environment?.dynamic?.appIdEnabled;

  private panosApplicationsSubject: BehaviorSubject<Map<string, PanosApplication[]>> = new BehaviorSubject<Map<string, PanosApplication[]>>(
    new Map(),
  );

  public panosApplications$: Observable<Map<string, PanosApplication[]>> = this.panosApplicationsSubject.asObservable();

  public dto = {
    panosApplicationsToAdd: [],
    panosApplicationsToRemove: [],
    firewallRuleId: '',
  };

  constructor(private appIdService: V1RuntimeDataAppIdRuntimeService) {}

  // Load PanosApplications for a specific version and store in the Map
  loadPanosApplications(appVersion: string, forceReload: boolean = false): void {
    if (!this.appIdEnabled) {
      return;
    }

    const currentData = this.panosApplicationsSubject.getValue();

    // Check if data for this version already exists and is not forced to reload
    if (!forceReload && currentData.has(appVersion) && currentData.get(appVersion)?.length > 0) {
      return; // Data already loaded, no need to fetch again
    }

    // Fetch applications from the API
    this.appIdService
      .getManyAppIdRuntime({ filter: [`appVersion||eq||${appVersion}`], relations: ['firewallRules'], perPage: 10000 })
      .subscribe(data => {
        const updatedMap = new Map(currentData);
        updatedMap.set(appVersion, data);
        this.panosApplicationsSubject.next(updatedMap);
      });
  }

  // Get the PanosApplications for a specific appVersion
  getPanosApplications(appVersion: string): Observable<PanosApplication[]> {
    if (!this.appIdEnabled) {
      return;
    }
    return this.panosApplications$.pipe(map(panosApplicationsMap => panosApplicationsMap.get(appVersion) || []));
  }

  // Modify the specific application data for a appVersion
  modifyApplicationData(modifiedApp: PanosApplication, appVersion: string): void {
    if (!this.appIdEnabled) {
      return;
    }
    const currentData = this.panosApplicationsSubject.getValue();
    const applications = currentData.get(appVersion) || [];

    // Replace the modified application in the list
    const updatedApplications = applications.map(app => (app.id === modifiedApp.id ? modifiedApp : app));

    // Update the map with modified data
    const updatedMap = new Map(currentData);
    updatedMap.set(appVersion, updatedApplications);

    // Push the updated map to the subject
    this.panosApplicationsSubject.next(updatedMap);
  }

  // Add PanosApplication to DTO
  addPanosApplicationToDto(panosApplication: PanosApplication): void {
    if (!this.appIdEnabled) {
      return;
    }
    if (this.dto.panosApplicationsToRemove.some(app => app.id === panosApplication.id)) {
      this.dto.panosApplicationsToRemove = this.dto.panosApplicationsToRemove.filter(app => app.id !== panosApplication.id);
      return;
    }

    this.dto.panosApplicationsToAdd.push(panosApplication);
  }
  // Remove PanosApplication from DTO
  removePanosApplicationFromDto(panosApplication: PanosApplication): void {
    if (!this.appIdEnabled) {
      return;
    }

    if (this.dto.panosApplicationsToAdd.some(app => app.id === panosApplication.id)) {
      this.dto.panosApplicationsToAdd = this.dto.panosApplicationsToAdd.filter(app => app.id !== panosApplication.id);
      return;
    }
    this.dto.panosApplicationsToRemove.push(panosApplication);
  }

  // Check if DTO is empty
  isDtoEmpty(): boolean {
    if (!this.appIdEnabled) {
      return;
    }
    return this.dto.panosApplicationsToAdd.length === 0 && this.dto.panosApplicationsToRemove.length === 0;
  }

  // Reset the DTO
  resetDto(): void {
    if (!this.appIdEnabled) {
      return;
    }

    if (!this.isDtoEmpty()) {
      const appIdVersion = this.dto.panosApplicationsToAdd[0]?.appVersion ?? this.dto.panosApplicationsToRemove[0]?.appVersion;
      this.dto = {
        panosApplicationsToAdd: [],
        panosApplicationsToRemove: [],
        firewallRuleId: '',
      };
      this.loadPanosApplications(appIdVersion, true);
    }
  }

  saveDto(firewallRule: FirewallRule): void {
    if (!this.appIdEnabled) {
      return;
    }

    const panosApplicationIdsToRemove = this.dto.panosApplicationsToRemove?.map(pa => pa.id) || [];
    firewallRule.panosApplications = firewallRule.panosApplications.filter(paApp => !panosApplicationIdsToRemove.includes(paApp.id));
    firewallRule.panosApplications = [...firewallRule.panosApplications, ...this.dto.panosApplicationsToAdd];
    firewallRule.panosApplications.forEach(paApp => {
      delete (paApp as any).firewallRules;
    });
  }

  // Add PanosApplication to FirewallRule
  public addPanosAppToFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule, appVersion: string): void {
    if (!this.appIdEnabled) {
      return;
    }

    panosApplication.firewallRules.push(firewallRule);
    this.modifyApplicationData(panosApplication, appVersion);
    this.addPanosApplicationToDto(panosApplication);
  }

  // Remove PanosApplication from FirewallRule
  public removePanosAppFromFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule, appVersion: string): void {
    if (!this.appIdEnabled) {
      return;
    }

    (panosApplication as any).firewallRules = panosApplication.firewallRules.filter(rule => rule.id !== firewallRule.id);
    this.modifyApplicationData(panosApplication, appVersion);
    this.removePanosApplicationFromDto(panosApplication);
  }
}
