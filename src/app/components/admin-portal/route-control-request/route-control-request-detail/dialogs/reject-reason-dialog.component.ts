import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-reject-reason-dialog',
  templateUrl: './reject-reason-dialog.component.html',
})
export class RejectReasonDialogComponent {
  public form: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<RejectReasonDialogComponent>,
    private formBuilder: FormBuilder,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: { title?: string },
  ) {
    this.form = this.formBuilder.group({
      reason: ['', [Validators.required, Validators.maxLength(500)]],
    });
  }

  public submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close({ reason: this.form.value.reason });
  }

  public async cancel(): Promise<void> {
    const hasText = (this.form.get('reason')?.value || '').trim().length > 0;
    if (!hasText) {
      this.dialogRef.close(null);
      return;
    }
    const result = await import('../dialogs/simple-confirm-dialog.component').then(m =>
      this.dialog
        .open(m.SimpleConfirmDialogComponent, {
          width: '420px',
          data: {
            title: 'Discard changes?',
            message: 'You have entered a rejection reason. Cancelling will discard your changes.',
            confirmText: 'Discard',
            cancelText: 'Keep Editing',
          },
        })
        .afterClosed()
        .toPromise(),
    );
    if (result === true) {
      this.dialogRef.close(null);
    }
  }
}
