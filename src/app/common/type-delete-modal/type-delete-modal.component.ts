import { Component, Input } from '@angular/core';
import { V1TiersService, V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-type-delete-modal',
  templateUrl: './type-delete-modal.component.html',
})
export class TypeDeleteModalComponent {
  @Input() objectToDelete;
  objectName: string;
  @Input() objectType: string;
  nameMismatch: boolean;
  constructor(private ngx: NgxSmartModalService, private tierService: V1TiersService, private tenantService: V2AppCentricTenantsService) {}

  deleteTier(): void {
    if (this.objectName === this.objectToDelete.name) {
      this.nameMismatch = false;
      this.tierService.cascadeDeleteTierTier({ id: this.objectToDelete.id }).subscribe(data => {
        this.closeModal();
        return data;
      });
    } else {
      this.nameMismatch = true;
    }
  }

  // TODO: Got rid of admin controller, need to update this.
  deleteTenant(): void {
    if (this.objectName === this.objectToDelete.name) {
      this.nameMismatch = false;
      this.tenantService.deleteOneTenant({ id: this.objectToDelete.id }).subscribe(data => {
        this.closeModal();
        return data;
      });
    } else {
      this.nameMismatch = true;
    }
  }

  delete(): void {
    if (this.objectType === 'tenant') {
      return this.deleteTenant();
    } else {
      if (this.objectType === 'tier') {
        return this.deleteTier();
      }
    }
  }

  public closeModal(): void {
    this.objectName = '';
    this.nameMismatch = false;
    this.ngx.resetModalData('typeDeleteModal');
    this.ngx.close('typeDeleteModal');
  }
}
