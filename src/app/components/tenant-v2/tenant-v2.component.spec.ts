import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { TenantV2Component } from './tenant-v2.component';

describe('TenantV2Component', () => {
  let component: TenantV2Component;
  let fixture: ComponentFixture<TenantV2Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TenantV2Component],
      schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(TenantV2Component);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render template without errors', () => {
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
