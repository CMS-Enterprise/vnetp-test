import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-resource-details-dialog',
  template: `
    <h2 mat-dialog-title>{{ data?.type }} Details</h2>
    <mat-dialog-content>
      <pre>{{ data?.payload | json }}</pre>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Close</button>
    </mat-dialog-actions>
  `,
})
export class ResourceDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { type: string; payload: any }) {}
}
