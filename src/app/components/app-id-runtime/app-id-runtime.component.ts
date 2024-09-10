import { Component, OnInit } from '@angular/core';
import { PanosApplication } from '../../../../client';
import { TierContextService } from '../../services/tier-context.service';
import { of } from 'rxjs';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppIdModalDto } from '../../models/other/app-id-modal.dto';

@Component({
  selector: 'app-app-id-runtime',
  templateUrl: './app-id-runtime.component.html',
  styleUrl: './app-id-runtime.component.css',
})
export class AppIdRuntimeComponent implements OnInit {
  tierId: string;
  firewallRuleId: string;
  panosApplications: PanosApplication[] = [];
  associatedApplications: PanosApplication[] = [];
  availableApplications: PanosApplication[] = [];

  constructor(private tierService: TierContextService, private ngx: NgxSmartModalService) {}

  ngOnInit(): void {}

  getAssociatedApplications(): void {
    this.associatedApplications = this.panosApplications.filter(application =>
      application.firewallRules?.some(rule => rule.id === this.firewallRuleId),
    );
  }

  getAvailableApplications(): void {
    this.tierService.currentTier.subscribe(tier => {
      let panosVersion = tier.panosVersion;

      if (!panosVersion) {
        this.refreshPanosVersion().subscribe(refreshedVersion => {
          panosVersion = refreshedVersion;
          this.filterAvailableApplications(panosVersion);
        });
      } else {
        this.filterAvailableApplications(panosVersion);
      }
    });
  }

  refreshPanosVersion() {
    return of('10.0.0');
  }

  filterAvailableApplications(panosVersion: string): void {
    this.availableApplications = this.panosApplications.filter(
      application => application.firewallRules?.every(rule => rule.id !== this.firewallRuleId) && application.panosVersion === panosVersion,
    );
  }

  save(): void {
    console.log('Saving');
  }

  closeModal() {
    this.ngx.close('appIdModal');
  }

  getData() {
    const dto = this.ngx.getModalData('appIdModal') as AppIdModalDto;
    this.tierId = dto.tierId;
    this.firewallRuleId = dto.firewallRuleId;
  }
}
