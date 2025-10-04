import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RejectReasonDialogComponent } from './reject-reason-dialog.component';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('RejectReasonDialogComponent', () => {
  let component: RejectReasonDialogComponent;
  let fixture: ComponentFixture<RejectReasonDialogComponent>;

  const mockDialogRef = { close: jest.fn() } as any as MatDialogRef<RejectReasonDialogComponent>;
  const mockDialog: any = { open: jest.fn() } as Partial<MatDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [RejectReasonDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { title: 'Reject Route Control Request' } },
        { provide: MatDialog, useValue: mockDialog },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(RejectReasonDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('submit with invalid form marks touched and does not close', () => {
    component.form.get('reason')?.setValue('');
    component.submit();
    expect(component.form.get('reason')?.touched).toBe(true);
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('submit with valid form closes with reason', () => {
    component.form.get('reason')?.setValue('Because of X');
    component.submit();
    expect(mockDialogRef.close).toHaveBeenCalledWith({ reason: 'Because of X' });
  });

  it('cancel with no text closes immediately with null', async () => {
    component.form.get('reason')?.setValue('');
    await component.cancel();
    expect(mockDialog.open).not.toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });

  it('cancel with text and user chooses keep editing does not close', async () => {
    component.form.get('reason')?.setValue('Some text');
    mockDialog.open = jest.fn().mockReturnValue({
      afterClosed: () => ({ toPromise: () => Promise.resolve(false) }),
    });
    await component.cancel();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockDialogRef.close).not.toHaveBeenCalled();
  });

  it('cancel with text and user confirms discard closes with null', async () => {
    component.form.get('reason')?.setValue('Some text');
    mockDialog.open = jest.fn().mockReturnValue({
      afterClosed: () => ({ toPromise: () => Promise.resolve(true) }),
    });
    await component.cancel();
    expect(mockDialog.open).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalledWith(null);
  });
});
