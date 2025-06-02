/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { TypeDeleteModalComponent } from './type-delete-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs/internal/observable/of';

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
    const closeModalSpy = jest.spyOn(component, 'closeModal');
    component.objectType = 'tenant';
    component.objectName = 'deleteMe';
    component.objectToDelete = { name: 'deleteMe', id: '123' };
    const cascadeDeleteTenantSpy = jest.spyOn(component['tenantService'], 'cascadeDeleteTenantTenant').mockReturnValue(of({} as any));
    component.delete();

    expect(cascadeDeleteTenantSpy).toHaveBeenCalled();
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('should cascade delete tier', () => {
    const closeModalSpy = jest.spyOn(component, 'closeModal');
    component.objectType = 'tier';
    component.objectName = 'deleteMe';
    component.objectToDelete = { name: 'deleteMe', id: '123' };
    const cascadeDeleteTierSpy = jest.spyOn(component['tierService'], 'cascadeDeleteTierTier').mockReturnValue(of({} as any));
    component.delete();
    expect(cascadeDeleteTierSpy).toHaveBeenCalled();
    expect(closeModalSpy).toHaveBeenCalled();
  });

  it('should determine a nameMismatch when deleting tier if the objectName and objectToDelete.name do not match', () => {
    component.objectType = 'tier';
    component.objectName = 'deleteMe';
    component.objectToDelete = { name: 'not-gonna-match', id: '123' };
    component.delete();
    expect(component.nameMismatch).toBeTruthy();
  });

  it('should determine a nameMismatch when deleting tier if the objectName and objectToDelete.name do not match', () => {
    component.objectType = 'tenant';
    component.objectName = 'deleteMe';
    component.objectToDelete = { name: 'not-gonna-match', id: '123' };
    component.delete();
    expect(component.nameMismatch).toBeTruthy();
  });

  it('should closeModal after ', () => {
    const closeModalSpy = jest.spyOn(component, 'closeModal');
    component.closeModal();
    expect(closeModalSpy).toHaveBeenCalled();
  });
});
