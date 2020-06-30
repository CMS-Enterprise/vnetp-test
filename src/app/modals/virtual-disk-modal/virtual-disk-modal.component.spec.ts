import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualDiskModalComponent } from './virtual-disk-modal.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from '../modal-mock';

describe('VirtualDiskModalComponent', () => {
  let component: VirtualDiskModalComponent;
  let fixture: ComponentFixture<VirtualDiskModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot(), HttpClientTestingModule],
      declarations: [VirtualDiskModalComponent, MockFontAwesomeComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualDiskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Name validity
  it('name should be valid', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(3));
    expect(name.valid).toBeTruthy();
  });

  it('name should be invalid, min length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(2));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, max length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(101));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, invalid characters', () => {
    const name = component.form.controls.name;
    name.setValue('invalid/name!');
    expect(name.valid).toBeFalsy();
  });

  // Description Validity
  it('description should be valid (null)', () => {
    const description = component.form.controls.description;
    description.setValue(null);
    expect(description.valid).toBeTruthy();
  });

  it('description should be valid (minlen)', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(3));
    expect(description.valid).toBeTruthy();
  });

  it('description should be invalid, min length', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(2));
    expect(description.valid).toBeFalsy();
  });

  it('description should be invalid, max length', () => {
    const description = component.form.controls.description;
    description.setValue('a'.repeat(501));
    expect(description.valid).toBeFalsy();
  });
});
