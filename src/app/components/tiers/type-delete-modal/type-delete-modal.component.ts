import { Component, Input } from '@angular/core';
import { V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-type-delete-modal',
  templateUrl: './type-delete-modal.component.html',
})
export class TypeDeleteModalComponent {
  @Input() tierToDelete;
  tierName;
  nameMismatch;
  constructor(private ngx: NgxSmartModalService, private tierService: V1TiersService) {}

  deleteTier() {
    if (this.tierName === this.tierToDelete.name) {
      this.nameMismatch = false;
      this.tierService.cascadeDeleteTierTier({ id: this.tierToDelete.id }).subscribe(data => {
        this.closeModal();
        return data;
      });
    } else {
      this.nameMismatch = true;
    }
  }

  public closeModal(): void {
    this.tierName = '';
    this.nameMismatch = false;
    this.ngx.resetModalData('typeDeleteModal');
    this.ngx.close('typeDeleteModal');
  }
}
