/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { ContractModalComponent } from './contract-modal.component';
import { Subscription } from 'rxjs';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { V2AppCentricSubjectsService } from 'client';

describe('ContractModalComponent', () => {
  let component: ContractModalComponent;
  let fixture: ComponentFixture<ContractModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ContractModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-subject-modal', inputs: ['contractId', 'tenantId'] }),
        MockIconButtonComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricSubjectsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string): boolean => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  describe('alias', () => {
    it('should have a maximum length of 100', () => {
      const { alias } = component.form.controls;

      alias.setValue('a');
      expect(alias.valid).toBe(true);

      alias.setValue('a'.repeat(101));
      expect(alias.valid).toBe(false);
    });
  });

  describe('description', () => {
    it('should have a maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
  });

  it('should have correct required and optional fields by default', () => {
    const requiredFields = ['name'];
    const optionalFields = ['alias', 'description'];

    requiredFields.forEach(r => {
      expect(isRequired(r)).toBe(true);
    });
    optionalFields.forEach(r => {
      expect(isRequired(r)).toBe(false);
    });
  });

  describe('importSubjectsConfig', () => {
    const mockNgxSmartModalComponent = {
      getData: jest.fn().mockReturnValue({ modalYes: true }),
      removeData: jest.fn(),
      onCloseFinished: {
        subscribe: jest.fn(),
      },
    };

    beforeEach(() => {
      component['ngx'] = {
        getModal: jest.fn().mockReturnValue({
          ...mockNgxSmartModalComponent,
          open: jest.fn(),
        }),
        setModalData: jest.fn(),
      } as any;
    });

    it('should display a confirmation modal with the correct message', () => {
      const event = [{ name: 'Subject 1' }, { name: 'Subject 1' }] as any;
      const modalDto = new YesNoModalDto('Import Subjects', `Are you sure you would like to import ${event.length} Subjects?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importSubjects(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import subjects and refresh the table on confirmation', () => {
      const event = [{ name: 'Subject 1' }, { name: 'Subject 1' }] as any;
      jest.spyOn(component, 'getSubjects');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['subjectsService'].createManySubject).toHaveBeenCalledWith({
          createManySubjectDto: { bulk: component.sanitizeData(event) },
        });

        mockNgxSmartModalComponent.onCloseFinished.subscribe((modal: typeof mockNgxSmartModalComponent) => {
          const data = modal.getData() as YesNoModalDto;
          modal.removeData();
          if (data && data.modalYes) {
            onConfirm();
          }
        });

        return new Subscription();
      });

      component.importSubjects(event);

      expect(component.getSubjects).toHaveBeenCalled();
    });
  });
});
