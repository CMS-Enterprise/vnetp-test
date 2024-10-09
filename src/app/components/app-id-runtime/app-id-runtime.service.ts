import { Injectable } from '@angular/core';
import {
  FirewallRule,
  PanosApplication,
  PanosApplicationFirewallRuleDto,
  V1NetworkSecurityFirewallRulesService,
  V1RuntimeDataAppIdRuntimeService,
} from '../../../../client';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AppIdRuntimeService {
  private panosApplicationsSubject: BehaviorSubject<Map<string, PanosApplication[]>> = new BehaviorSubject<Map<string, PanosApplication[]>>(
    new Map(),
  );

  public panosApplications$: Observable<Map<string, PanosApplication[]>> = this.panosApplicationsSubject.asObservable();

  public dto: PanosApplicationFirewallRuleDto = {
    panosApplicationsToAdd: [],
    panosApplicationsToRemove: [],
    firewallRuleId: '',
  };

  private removedFirewallRules: FirewallRule[] = [];

  constructor(private appIdService: V1RuntimeDataAppIdRuntimeService, private firewallRuleService: V1NetworkSecurityFirewallRulesService) {}

  // Load PanosApplications for a specific version and store in the Map
  loadPanosApplications(appVersion: string, forceReload: boolean = false): void {
    const currentData = this.panosApplicationsSubject.getValue();
    console.log('app version during load apps ', appVersion);

    // Check if data for this version already exists and is not forced to reload
    if (!forceReload && currentData.has(appVersion) && currentData.get(appVersion)?.length > 0) {
      return; // Data already loaded, no need to fetch again
    }

    // Fetch applications from the API
    this.appIdService
      .getManyAppIdRuntime({ filter: [`appVersion||eq||${appVersion}`], relations: ['firewallRules'], perPage: 10000 })
      .subscribe(data => {
        console.log('data during load apps ', data.length);
        const updatedMap = new Map(currentData);
        updatedMap.set(appVersion, data);
        this.panosApplicationsSubject.next(updatedMap);
      });
  }

  // Get the PanosApplications for a specific appVersion
  getPanosApplications(appVersion: string): Observable<PanosApplication[]> {
    console.log('appVersion during get apps ', appVersion);
    return this.panosApplications$.pipe(map(panosApplicationsMap => panosApplicationsMap.get(appVersion) || []));
  }

  // Modify the specific application data for a appVersion
  modifyApplicationData(modifiedApp: PanosApplication, appVersion: string): void {
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
    if (this.dto.panosApplicationsToRemove.some(app => app.id === panosApplication.id)) {
      this.dto.panosApplicationsToRemove = this.dto.panosApplicationsToRemove.filter(app => app.id !== panosApplication.id);
      return;
    }
    this.dto.panosApplicationsToAdd.push(panosApplication);
  }
  // Remove PanosApplication from DTO
  removePanosApplicationFromDto(panosApplication: PanosApplication): void {
    if (this.dto.panosApplicationsToAdd.some(app => app.id === panosApplication.id)) {
      this.dto.panosApplicationsToAdd = this.dto.panosApplicationsToAdd.filter(app => app.id !== panosApplication.id);
      return;
    }
    this.dto.panosApplicationsToRemove.push(panosApplication);
  }

  // Check if DTO is empty
  isDtoEmpty(): boolean {
    return this.dto.panosApplicationsToAdd.length === 0 && this.dto.panosApplicationsToRemove.length === 0;
  }

  // Reset the DTO
  resetDto(): void {
    console.log('reset dto');

    this.dto.panosApplicationsToAdd.forEach(panosApplication => {
      (panosApplication as any).firewallRules = panosApplication.firewallRules.filter(rule => rule.id !== this.dto.firewallRuleId);
      this.modifyApplicationData(panosApplication, panosApplication.appVersion);
    });

    this.removedFirewallRules.forEach(firewallRule => {
      this.dto.panosApplicationsToRemove.forEach(panosApplication => {
        if (!panosApplication.firewallRules.includes(firewallRule)) {
          panosApplication.firewallRules.push(firewallRule);
        }
        this.modifyApplicationData(panosApplication, panosApplication.appVersion);
      });
    });

    this.removedFirewallRules = [];

    this.dto = {
      panosApplicationsToAdd: [],
      panosApplicationsToRemove: [],
      firewallRuleId: '',
    };

    console.log('dto after reset', this.dto);
  }

  // Save the DTO for a specific firewallRuleId
  saveDto(firewallRuleId: string): Observable<FirewallRule> {
    this.dto.firewallRuleId = firewallRuleId;
    return this.firewallRuleService.modifyPanosApplicationsFirewallRule({
      panosApplicationFirewallRuleDto: this.dto,
    });
  }

  // Add PanosApplication to FirewallRule
  public addPanosAppToFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule, appVersion: string): void {
    panosApplication.firewallRules.push(firewallRule);
    this.modifyApplicationData(panosApplication, appVersion);
    this.addPanosApplicationToDto(panosApplication);
  }

  // Remove PanosApplication from FirewallRule
  public removePanosAppFromFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule, appVersion: string): void {
    this.removedFirewallRules.push(firewallRule);
    (panosApplication as any).firewallRules = panosApplication.firewallRules.filter(rule => rule.id !== firewallRule.id);
    this.modifyApplicationData(panosApplication, appVersion);
    this.removePanosApplicationFromDto(panosApplication);
  }
}
