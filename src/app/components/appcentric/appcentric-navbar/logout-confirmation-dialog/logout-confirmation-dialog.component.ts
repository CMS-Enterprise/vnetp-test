import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-logout-confirmation-dialog',
  templateUrl: './logout-confirmation-dialog.component.html',
  styleUrls: ['./logout-confirmation-dialog.component.scss'],
})
export class LogoutConfirmationDialogComponent {
  constructor(private dialogRef: MatDialogRef<LogoutConfirmationDialogComponent>) {}

  public cancel(): void {
    this.dialogRef.close('cancel');
  }

  public confirm(): void {
    this.dialogRef.close('confirm');
  }
}
