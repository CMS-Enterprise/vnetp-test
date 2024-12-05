/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { FilterEntryModalComponent } from './filter-entry-modal/filter-entry-modal.component';

import { FilterModalComponent } from './filter-modal.component';
import { YesNoModalDto } from 'src/app/models/other/yes-no-modal-dto';
import SubscriptionUtil from 'src/app/utils/SubscriptionUtil';
import { of, Subject, Subscription } from 'rxjs';
import { FilterEntry, V2AppCentricFilterEntriesService, V2AppCentricFiltersService } from 'client';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { By } from '@angular/platform-browser';
import { RouteProfileModalDto } from 'src/app/models/appcentric/route-profile-modal-dto';
import { FilterEntryModalDto } from 'src/app/models/appcentric/filter-entry-modal.dto';

describe('FilterEntryModalComponent', () => {
  let component: FilterModalComponent;
  let fixture: ComponentFixture<FilterModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        FilterModalComponent,
        FilterEntryModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent('app-filter-entry-edit-modal'),
        MockIconButtonComponent,
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule, NgSelectModule, FormsModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricFilterEntriesService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FilterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const getFormControl = (prop: string): FormControl => component.form.controls[prop] as FormControl;
  const isRequired = (prop: string) => {
    const fc = getFormControl(prop);
    fc.setValue(null);
    return !!fc.errors && !!fc.errors.required;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete route profile', () => {
    const filterEntryToDelete = { id: '123', description: 'Bye!' } as FilterEntry;
    const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');
    component.removeFilterEntry(filterEntryToDelete);
    jest.spyOn(component, 'getFilterEntries');
    expect(subscribeToYesNoModalSpy).toHaveBeenCalled();
  });

  it('should restore route profile', () => {
    const filterEntry = { id: '1', deletedAt: true } as any;
    jest.spyOn(component['filterEntriesService'], 'restoreOneFilterEntry').mockReturnValue(of({} as any));
    jest.spyOn(component, 'getFilterEntries');
    component.restoreFilterEntry(filterEntry);
    expect(component['filterEntriesService'].restoreOneFilterEntry).toHaveBeenCalledWith({ id: filterEntry.id });
    expect(component.getFilterEntries).toHaveBeenCalled();
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

  describe('importFilterEntries', () => {
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
      const event = [{ name: 'Filter 1' }, { name: 'Filter 1' }] as any;
      const modalDto = new YesNoModalDto('Import Filter Entries', `Are you sure you would like to import ${event.length} Filter Entries?`);
      const subscribeToYesNoModalSpy = jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal');

      component.importFilterEntries(event);

      expect(subscribeToYesNoModalSpy).toHaveBeenCalledWith(modalDto, component['ngx'], expect.any(Function), expect.any(Function));
    });

    it('should import filter entries and refresh on confirmation', () => {
      const event = [{ name: 'Filter Entry 1' }, { name: 'Filter Entry 1' }] as any;
      jest.spyOn(component, 'getFilterEntries');
      jest.spyOn(SubscriptionUtil, 'subscribeToYesNoModal').mockImplementation((modalDto, ngx, onConfirm, onClose) => {
        onConfirm();

        expect(component['filterEntriesService'].createManyFilterEntry).toHaveBeenCalledWith({
          createManyFilterEntryDto: { bulk: component.sanitizeData(event) },
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

      component.importFilterEntries(event);

      expect(component.getFilterEntries).toHaveBeenCalled();
    });
  });

  it('should call to create an Application Profile', () => {
    const service = TestBed.inject(V2AppCentricFiltersService);
    const createAppProfileSpy = jest.spyOn(service, 'createOneFilter');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: 'ap-1',
      alias: '',
      description: 'description!',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createAppProfileSpy).toHaveBeenCalled();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('filterModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
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

  describe('getData', () => {
    const createAppProfileDto = () => ({
      modalMode: ModalMode.Edit,
      filter: { id: 1 },
    });
    it('should run getData', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createAppProfileDto());
      jest.spyOn(component, 'getFilterEntries');
      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);

      expect(component.getFilterEntries).toHaveBeenCalled();
    });
  });

  describe('openRouteProfileModal', () => {
    describe('openModal', () => {
      beforeEach(() => {
        jest.spyOn(component, 'getFilterEntries');
        jest.spyOn(component['ngx'], 'resetModalData');
      });

      it('should subscribe to routeProfileModal onCloseFinished event and unsubscribe afterwards', () => {
        const onCloseFinished = new Subject<void>();
        const mockModal = { onCloseFinished, open: jest.fn() };
        jest.spyOn(component['ngx'], 'getModal').mockReturnValue(mockModal as any);

        const unsubscribeSpy = jest.spyOn(Subscription.prototype, 'unsubscribe');

        component.subscribeToFilterEntryModal();

        expect(component['ngx'].getModal).toHaveBeenCalledWith('filterEntryModal');
        expect(component.filterEntryEditModalSubscription).toBeDefined();

        onCloseFinished.next();

        expect(component.getFilterEntries).toHaveBeenCalled();
        expect(component['ngx'].resetModalData).toHaveBeenCalledWith('filterEntryModal');

        expect(unsubscribeSpy).toHaveBeenCalled();
      });
      it('should call ngx.setModalData and ngx.getModal().open', () => {
        const filterEntry = { id: 1, name: 'Test App Profile' } as any;
        component.tenantId = { id: '1' } as any;
        component.openFilterEntryModal(ModalMode.Edit, filterEntry);

        expect(component['ngx'].setModalData).toHaveBeenCalledWith(expect.any(FilterEntryModalDto), 'filterEntryModal');
        expect(component['ngx'].getModal).toHaveBeenCalledWith('filterEntryModal');

        const modal = component['ngx'].getModal('filterEntryModal');
        expect(modal).toBeDefined();
      });
    });
  });
});
