/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { TypeDeleteModalComponent } from './type-delete-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

describe('TypeDeleteModal', () => {
  let component: TypeDeleteModalComponent;
  let fixture: ComponentFixture<TypeDeleteModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TypeDeleteModalComponent, MockNgxSmartModalComponent],
      imports: [HttpClientModule, RouterTestingModule, ReactiveFormsModule, FormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TypeDeleteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should cascade delete tenant', () => {
    component.objectType = 'tenant';
    component.objectName = 'deleteMe';
    component.objectToDelete = { name: 'deleteMe', id: '123' };
    const deleteTenantSpy = jest.spyOn(component, 'deleteTenant');
    const cascadeDeleteTenantSpy = jest.spyOn(component['tenantService'], 'cascadeDeleteTenantTenant');
    component.delete();
    expect(deleteTenantSpy).toHaveBeenCalled();
    expect(cascadeDeleteTenantSpy).toHaveBeenCalled();
  });

  it('should cascade delete tier', () => {
    component.objectType = 'tier';
    component.objectName = 'deleteMe';
    component.objectToDelete = { name: 'deleteMe', id: '123' };
    const deleteTierSpy = jest.spyOn(component, 'deleteTier');
    const cascadeDeleteTierSpy = jest.spyOn(component['tierService'], 'cascadeDeleteTierTier');
    component.delete();
    expect(deleteTierSpy).toHaveBeenCalled();
    expect(cascadeDeleteTierSpy).toHaveBeenCalled();
  });
});
