import { Injectable } from '@angular/core';
import { FirewallRule, PanosApplication, V1RuntimeDataAppIdRuntimeService } from '../../../../client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppIdRuntimeService {
  public environment = environment;
  public appIdEnabled: boolean = this.environment?.dynamic?.appIdEnabled;

  private panosApplicationsSubject: BehaviorSubject<PanosApplication[]> = new BehaviorSubject<PanosApplication[]>([]);

  public panosApplications$: Observable<PanosApplication[]> = this.panosApplicationsSubject.asObservable();

  public dto = {
    panosApplicationsToAdd: [],
    panosApplicationsToRemove: [],
    firewallRuleId: '',
  };

  constructor(private appIdService: V1RuntimeDataAppIdRuntimeService) {}

  // Load PanosApplications for a specific version and store in the Map
  loadPanosApplications(forceReload: boolean = false): void {
    if (!this.appIdEnabled) {
      return;
    }
    console.log('loadPanosApplications', forceReload);
    const currentData = this.panosApplicationsSubject.getValue();

    // Check if data for this version already exists and is not forced to reload
    if (!forceReload && currentData?.length > 0) {
      return; // Data already loaded, no need to fetch again
    }

    // Fetch applications from the API
    this.appIdService.getManyAppIdRuntime({ relations: ['firewallRules'], perPage: 10000 }).subscribe(data => {
      this.panosApplicationsSubject.next(data);
    });
  }

  getPanosApplications(): Observable<PanosApplication[]> {
    if (!this.appIdEnabled) {
      return;
    }
    return this.panosApplications$;
  }

  modifyApplicationData(modifiedApp: PanosApplication): void {
    if (!this.appIdEnabled) {
      return;
    }
    const currentData = this.panosApplicationsSubject.getValue();
    const applications = currentData || [];

    // Replace the modified application in the list
    const updatedApplications = applications.map(app => (app.id === modifiedApp.id ? modifiedApp : app));

    // Update the map with modified data
    this.panosApplicationsSubject.next(updatedApplications);
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
      this.dto = {
        panosApplicationsToAdd: [],
        panosApplicationsToRemove: [],
        firewallRuleId: '',
      };
      this.loadPanosApplications(true);
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
  public addPanosAppToFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule): void {
    if (!this.appIdEnabled) {
      return;
    }

    panosApplication.firewallRules.push(firewallRule);
    this.modifyApplicationData(panosApplication);
    this.addPanosApplicationToDto(panosApplication);
  }

  // Remove PanosApplication from FirewallRule
  public removePanosAppFromFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule): void {
    if (!this.appIdEnabled) {
      return;
    }

    (panosApplication as any).firewallRules = panosApplication.firewallRules.filter(rule => rule.id !== firewallRule.id);
    this.modifyApplicationData(panosApplication);
    this.removePanosApplicationFromDto(panosApplication);
  }
}
