import { Component, OnInit } from '@angular/core';
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
export class AppIdRuntimeComponent implements OnInit {
  tier: Tier;
  firewallRule: FirewallRule;
  panosApplications: PanosApplication[] = [];
  associatedApplications: PanosApplication[] = [];
  availableApplications: PanosApplication[] = [];
  saveClose = false;

  constructor(private ngx: NgxSmartModalService, private appIdService: AppIdRuntimeService) {}

  ngOnInit(): void {
    this.appIdService.getPanosApplications().subscribe(applications => {
      if (applications.length === 0) {
        this.appIdService.loadPanosApplications();
      }

      this.panosApplications = applications;
      if (this.tier) {
        this.getAssociatedApplications();
        this.getAvailableApplications();
      }
    });
  }

  getAssociatedApplications(): void {
    this.associatedApplications = this.panosApplications.filter(application =>
      application.firewallRules?.some(rule => rule.id === this.firewallRule.id),
    );
  }

  getAvailableApplications(): void {
    this.filterAvailableApplications(this.tier.panosVersion);
  }

  filterAvailableApplications(panosVersion: string): void {
    this.availableApplications = this.panosApplications.filter(
      application =>
        application.firewallRules?.every(rule => rule.id !== this.firewallRule.id) && application.panosVersion === panosVersion,
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
      this.appIdService.dto.panosApplicationsToRemove.forEach(app => this.appIdService.addPanosApplicaionToDto(app));
      this.appIdService.resetDto();
      this.ngx.close('appIdModal');
    };

    SubscriptionUtil.subscribeToYesNoModal(modalDto, this.ngx, onConfirm);
  }

  getData() {
    const dto = this.ngx.getModalData('appIdModal') as AppIdModalDto;
    this.tier = dto.tier;
    this.firewallRule = dto.firewallRule;
    this.getAssociatedApplications();
    this.getAvailableApplications();
  }
}
