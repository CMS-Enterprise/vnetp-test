import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-used-objects-parents-modal',
  templateUrl: './used-objects-parents-modal.component.html',
})
export class UsedObjectsParentsModalComponent {
  @Input() usedObjectsParentsInput;

  public config = {
    description: 'Service Object Usage',
    columns: [
      {
        name: 'Name',
        property: 'name',
      },
    ],
  };
}
