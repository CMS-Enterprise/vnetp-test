import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { ActifioApplicationDto } from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-vm-discovery-modal',
  templateUrl: './vm-discovery-modal.component.html',
  styles: ['.loading { display: flex; flex-direction: column; align-items: center'],
})
export class VmDiscoveryModalComponent {
  @ViewChild('selectVCenter') selectVCenterTemplate: TemplateRef<any>;
  @ViewChild('selectVirtualMachines') selectVirtualMachinesTemplate: TemplateRef<any>;
  @ViewChild('selectAction') selectActionTemplate: TemplateRef<any>;

  public currentDiscoveryStepTemplate: TemplateRef<any>;
  public selectedVirtualMachines: ActifioApplicationDto[] = [];
  public selectedVCenterId: string;

  constructor(private changeRef: ChangeDetectorRef, private ngx: NgxSmartModalService) {}

  public onLoad(): void {
    this.currentDiscoveryStepTemplate = this.selectVCenterTemplate;
    this.changeRef.detectChanges();
  }

  public onClose(): void {
    this.ngx.close('vmDiscoveryModal');
    this.currentDiscoveryStepTemplate = this.selectVCenterTemplate;

    this.selectedVCenterId = null;
    this.selectedVirtualMachines = [];
  }

  public onVirtualMachinesAdded(virtualMachines: ActifioApplicationDto[] = []): void {
    this.selectedVirtualMachines = virtualMachines;
    this.currentDiscoveryStepTemplate = this.selectActionTemplate;
  }

  public onVCenterSelected(vCenterId: string): void {
    this.selectedVCenterId = vCenterId;
    this.currentDiscoveryStepTemplate = this.selectVirtualMachinesTemplate;
  }

  public onActionComplete(): void {
    this.onClose();
  }
}
