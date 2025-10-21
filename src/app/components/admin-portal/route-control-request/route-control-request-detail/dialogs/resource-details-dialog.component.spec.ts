import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResourceDetailsDialogComponent } from './resource-details-dialog.component';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('ResourceDetailsDialogComponent', () => {
  let component: ResourceDetailsDialogComponent;
  let fixture: ComponentFixture<ResourceDetailsDialogComponent>;

  const data = { type: 'ExternalVrfConnection', payload: { id: 'id-1', name: 'Conn-1' } };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ResourceDetailsDialogComponent],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: data }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.data).toEqual(data);
  });

  it('renders the dialog title with type', () => {
    const titleEl = fixture.debugElement.query(By.css('h2'));
    expect(titleEl.nativeElement.textContent).toContain('ExternalVrfConnection Details');
  });

  it('renders JSON payload in <pre>', () => {
    const preEl = fixture.debugElement.query(By.css('pre'));
    expect(preEl).toBeTruthy();
    const text = preEl.nativeElement.textContent.trim();
    expect(text).toContain('id');
    expect(text).toContain('name');
    expect(text).toContain('id-1');
    expect(text).toContain('Conn-1');
  });
});
