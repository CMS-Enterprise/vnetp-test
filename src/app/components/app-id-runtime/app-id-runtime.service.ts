import { Injectable } from '@angular/core';
import {
  FirewallRule,
  PanosApplication,
  PanosApplicationFirewallRuleDto,
  V1NetworkSecurityFirewallRulesService,
  V1RuntimeDataAppIdRuntimeService,
} from '../../../../client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AppIdRuntimeService {
  private panosApplicationsSubject: BehaviorSubject<PanosApplication[]> = new BehaviorSubject<PanosApplication[]>([]);
  public panosApplications$: Observable<PanosApplication[]> = this.panosApplicationsSubject.asObservable();
  public dto: PanosApplicationFirewallRuleDto = {
    panosApplicationsToAdd: [],
    panosApplicationsToRemove: [],
    firewallRuleId: '',
  };

  constructor(private appIdService: V1RuntimeDataAppIdRuntimeService, private firewallRuleService: V1NetworkSecurityFirewallRulesService) {}

  loadPanosApplications(forceReload: boolean = false): void {
    if (forceReload || this.panosApplicationsSubject.getValue().length === 0) {
      this.appIdService.getManyAppIdRuntime({ relations: ['firewallRules'], perPage: 10000 }).subscribe(data => {
        this.panosApplicationsSubject.next(data);
      });
    }
  }

  getPanosApplications(): Observable<PanosApplication[]> {
    return this.panosApplications$;
  }

  modifyApplicationData(modifiedApp: PanosApplication): void {
    const currentData = this.panosApplicationsSubject.getValue();
    const updatedData = currentData.map(app => (app.id === modifiedApp.id ? modifiedApp : app));
    this.panosApplicationsSubject.next(updatedData);
  }

  addPanosApplicaionToDto(panosApplication: PanosApplication): void {
    if (this.dto.panosApplicationsToRemove.includes(panosApplication)) {
      this.dto.panosApplicationsToRemove = this.dto.panosApplicationsToRemove.filter(app => app.id !== panosApplication.id);
      return;
    }
    this.dto.panosApplicationsToAdd.push(panosApplication);
  }

  removePanosApplicationFromDto(panosApplication: PanosApplication): void {
    if (this.dto.panosApplicationsToAdd.includes(panosApplication)) {
      this.dto.panosApplicationsToAdd = this.dto.panosApplicationsToAdd.filter(app => app.id !== panosApplication.id);
      return;
    }
    this.dto.panosApplicationsToRemove.push(panosApplication);
  }

  isDtoEmpty(): boolean {
    return this.dto.panosApplicationsToAdd.length === 0 && this.dto.panosApplicationsToRemove.length === 0;
  }

  resetDto(): void {
    this.dto = {
      panosApplicationsToAdd: [],
      panosApplicationsToRemove: [],
      firewallRuleId: '',
    };
  }

  saveDto(firewallRuleId: string): Observable<FirewallRule> {
    this.dto.firewallRuleId = firewallRuleId;
    return this.firewallRuleService.modifyPanosApplicationsFirewallRule({
      panosApplicationFirewallRuleDto: this.dto,
    });
  }

  public addPanosAppToFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule): void {
    panosApplication.firewallRules.push(firewallRule);
    this.modifyApplicationData(panosApplication);
    this.addPanosApplicaionToDto(panosApplication);
  }

  public removePanosAppFromFirewallRule(panosApplication: PanosApplication, firewallRule: FirewallRule): void {
    (panosApplication.firewallRules as any) = panosApplication.firewallRules.filter(rule => rule.id !== firewallRule.id);
    this.modifyApplicationData(panosApplication);
    this.removePanosApplicationFromDto(panosApplication);
  }
}
