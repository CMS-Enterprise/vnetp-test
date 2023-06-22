import { Component, Input, OnInit } from '@angular/core';
import { V1TiersService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-type-delete-modal',
  templateUrl: './type-delete-modal.component.html',
})
export class TypeDeleteModalComponent implements OnInit {
  @Input() tierToDelete;
  tierName;
  constructor(private ngx: NgxSmartModalService, private tierService: V1TiersService) {}
  ngOnInit(): void {
    console.log('tierToDelete', this.tierToDelete);
  }

  onOpen() {}

  deleteTier() {
    console.log('tierName', this.tierName);
    console.log('tierToDelete', this.tierToDelete);
    if (this.tierName === this.tierToDelete.name) {
      console.log('full match');
    }
  }

  public closeModal(): void {
    this.tierName = '';
    this.ngx.resetModalData('typeDeleteModal');
    this.ngx.close('typeDeleteModal');
  }
}
