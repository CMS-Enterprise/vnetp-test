import { ChangeDetectorRef, Component, TemplateRef, ViewChild } from '@angular/core';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-vm-discovery-modal',
  templateUrl: './vm-discovery-modal.component.html',
  styles: ['.loading { display: flex; flex-direction: column; align-items: center'],
})
export class VmDiscoveryModalComponent {
  @ViewChild('selectVCenterTemplate', { static: false }) selectVCenterTemplate: TemplateRef<any>;
  @ViewChild('selectVirtualMachinesTemplate', { static: false }) selectVirtualMachinesTemplate: TemplateRef<any>;

  public currentDiscoveryStepTemplate: TemplateRef<any>;
  public selectedVirtualMachineIds = new Set<string>();
  public selectedVCenterId: number;

  constructor(private changeRef: ChangeDetectorRef, private ngx: NgxSmartModalService) {}

  public onLoad(): void {
    this.currentDiscoveryStepTemplate = this.selectVCenterTemplate;
    this.changeRef.detectChanges();
  }

  public onClose(): void {
    this.ngx.close('vmDiscoveryModal');
    this.currentDiscoveryStepTemplate = this.selectVCenterTemplate;

    this.selectedVCenterId = null;
    this.selectedVirtualMachineIds = new Set<string>();
  }

  public onVirtualMachinesSelected(virtualMachineIds: Set<string>): void {
    this.selectedVirtualMachineIds = virtualMachineIds;
  }

  public onVCenterSelected(vCenterId: number): void {
    this.selectedVCenterId = vCenterId;
    this.currentDiscoveryStepTemplate = this.selectVirtualMachinesTemplate;
  }
}
