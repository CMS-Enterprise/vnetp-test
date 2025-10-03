import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-vrf-rejection-reason-dialog',
  template: `
    <h2 mat-dialog-title>Rejection Reason</h2>
    <mat-dialog-content>
      <div style="max-height: 50vh; overflow: auto; white-space: pre-wrap;">{{ data?.reason }}</div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button class="btn btn-secondary" mat-button (click)="dialogRef.close()">Close</button>
    </mat-dialog-actions>
  `,
})
export class VrfRejectionReasonDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<VrfRejectionReasonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { reason: string },
  ) {}
}
