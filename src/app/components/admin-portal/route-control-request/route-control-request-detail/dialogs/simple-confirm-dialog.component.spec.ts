import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleConfirmDialogComponent } from './simple-confirm-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('SimpleConfirmDialogComponent', () => {
  let fixture: ComponentFixture<SimpleConfirmDialogComponent>;
  let component: SimpleConfirmDialogComponent;

  const mockDialogRef = { close: jest.fn() } as any as MatDialogRef<SimpleConfirmDialogComponent>;

  function setup(data: any) {
    return TestBed.configureTestingModule({
      declarations: [SimpleConfirmDialogComponent],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: data },
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();
  }

  it('should create with defaults and render default texts', async () => {
    await setup(null);
    fixture = TestBed.createComponent(SimpleConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component).toBeTruthy();

    const titleEl = fixture.debugElement.query(By.css('h2')).nativeElement as HTMLElement;
    const msgEl = fixture.debugElement.query(By.css('mat-dialog-content p')).nativeElement as HTMLElement;
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelBtn = buttons[0].nativeElement as HTMLElement;
    const confirmBtn = buttons[1].nativeElement as HTMLElement;

    expect(titleEl.textContent).toContain('Confirm');
    expect(msgEl.textContent).toContain('Are you sure?');
    expect(cancelBtn.textContent).toContain('Cancel');
    expect(confirmBtn.textContent).toContain('Confirm');
  });

  it('renders provided texts and closes with values on actions', async () => {
    jest.clearAllMocks();
    await setup({ title: 'My Title', message: 'Really do it?', confirmText: 'Do it', cancelText: 'Back' });
    fixture = TestBed.createComponent(SimpleConfirmDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    const titleEl = fixture.debugElement.query(By.css('h2')).nativeElement as HTMLElement;
    const msgEl = fixture.debugElement.query(By.css('mat-dialog-content p')).nativeElement as HTMLElement;
    const buttons = fixture.debugElement.queryAll(By.css('button'));
    const cancelBtn = buttons[0].nativeElement as HTMLButtonElement;
    const confirmBtn = buttons[1].nativeElement as HTMLButtonElement;

    expect(titleEl.textContent).toContain('My Title');
    expect(msgEl.textContent).toContain('Really do it?');
    expect(cancelBtn.textContent).toContain('Back');
    expect(confirmBtn.textContent).toContain('Do it');

    component.onConfirm();
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    jest.clearAllMocks();

    component.onCancel();
    expect(mockDialogRef.close).toHaveBeenCalledWith(false);
  });
});
