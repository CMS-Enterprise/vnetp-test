import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PanosApplication } from '../../../../../client';

@Component({
  selector: 'app-panos-application-details-dialog',
  templateUrl: './panos-application-details-dialog.component.html',
  styleUrls: ['./panos-application-details-dialog.component.css'],
})
export class PanosApplicationDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: PanosApplication) {}
}
