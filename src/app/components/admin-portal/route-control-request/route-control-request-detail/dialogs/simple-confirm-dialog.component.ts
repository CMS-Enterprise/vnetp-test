import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-simple-confirm-dialog',
  template: `
    <h2 mat-dialog-title>{{ data?.title || 'Confirm' }}</h2>
    <mat-dialog-content>
      <p>{{ data?.message || 'Are you sure?' }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">{{ data?.cancelText || 'Cancel' }}</button>
      <button mat-raised-button color="warn" (click)="onConfirm()">{{ data?.confirmText || 'Confirm' }}</button>
    </mat-dialog-actions>
  `,
})
export class SimpleConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<SimpleConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string; message?: string; confirmText?: string; cancelText?: string },
  ) {}

  onConfirm(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}
