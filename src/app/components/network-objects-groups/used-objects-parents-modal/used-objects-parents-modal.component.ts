import { Component, Input, TemplateRef, ViewChild } from '@angular/core';
import { V1NetworkSecurityNetworkObjectsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';

@Component({
  selector: 'app-used-objects-parents-modal',
  templateUrl: './used-objects-parents-modal.component.html',
})
export class UsedObjectsParentsModalComponent {
  @Input() usedObjectsParentsInput;

  public config = {
    description: 'Network Object Usage',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
    ],
  };

  constructor(private ngx: NgxSmartModalService) {}
}
