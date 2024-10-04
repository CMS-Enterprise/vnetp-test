import { Component } from '@angular/core';
import { FirewallRule, PanosApplication, Tier } from '../../../../client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AppIdModalDto } from '../../models/other/app-id-modal.dto';
import { AppIdRuntimeService } from './app-id-runtime.service';
import { YesNoModalDto } from '../../models/other/yes-no-modal-dto';
import SubscriptionUtil from '../../utils/SubscriptionUtil';

@Component({
  selector: 'app-app-id-runtime',
  templateUrl: './app-id-runtime.component.html',
  styleUrl: './app-id-runtime.component.css',
})
export class AppIdRuntimeComponent {
  tier: Tier;
  firewallRule: FirewallRule;
  panosApplications: PanosApplication[] = [];
  associatedApplications: PanosApplication[] = [];
  availableApplications: PanosApplication[] = [];
  saveClose = false;

  constructor(private ngx: NgxSmartModalService, private appIdService: AppIdRuntimeService) {}

  getAssociatedApplications(): void {
    this.associatedApplications = this.panosApplications.filter(application =>
      application.firewallRules?.some(rule => rule.id === this.firewallRule.id),
    );
  }

  getAvailableApplications(): void {
    this.filterAvailableApplications();
  }

  filterAvailableApplications(): void {
    this.availableApplications = this.panosApplications.filter(application =>
      application.firewallRules?.every(rule => rule.id !== this.firewallRule.id),
    );
  }

  save(): void {
    this.saveClose = true;
    this.ngx.close('appIdModal');
    this.saveClose = false;
  }

  closeModal(): void {
    if (this.saveClose) {
      return;
    }

    if (this.appIdService.isDtoEmpty() && !this.saveClose) {
      this.ngx.close('appIdModal');
      return;
    }

    const modalDto = new YesNoModalDto('Panos Application Changes', 'You have unsaved changes. Are you sure you want to close this modal?');

    const onConfirm = () => {
      this.appIdService.dto.panosApplicationsToAdd.forEach(app => this.appIdService.removePanosApplicationFromDto(app));
      this.appIdService.dto.panosApplicationsToRemove.forEach(app => this.appIdService.addPanosApplicationToDto(app));
      this.appIdService.resetDto();
      this.ngx.close('appIdModal');
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  getData() {
    const dto = this.ngx.getModalData('appIdModal') as AppIdModalDto;
    this.tier = dto.tier;
    this.firewallRule = dto.firewallRule;
    this.appIdService.getPanosApplications(this.tier.appVersion).subscribe(applications => {
      console.log('applications', applications);
      this.panosApplications = applications;
      this.getAssociatedApplications();
      this.getAvailableApplications();
    });
  }
}
