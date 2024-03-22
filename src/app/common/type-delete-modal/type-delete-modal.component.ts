import { Component, Input } from '@angular/core';
import { V1TiersService, V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-type-delete-modal',
  templateUrl: './type-delete-modal.component.html',
})
export class TypeDeleteModalComponent {
  @Input() objectToDelete;
  objectName;
  objectType;
  nameMismatch;
  constructor(private ngx: NgxSmartModalService, private tierService: V1TiersService, private tenantService: V2AppCentricTenantsService) {}

  deleteTier() {
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

  // deleteTenant() {
  //   if (this.objectName === this.objectToDelete.name) {
  //     this.nameMismatch = false;
  //     this.tenantService.cascadeDeleteTenant({ id: this.objectToDelete.id }).subscribe(data => {
  //       this.closeModal();
  //       return data;
  //     });
  //   } else {
  //     this.nameMismatch = true;
  //   }
  // }

  public closeModal(): void {
    this.objectName = '';
    this.nameMismatch = false;
    this.ngx.resetModalData('typeDeleteModal');
    this.ngx.close('typeDeleteModal');
  }
}
