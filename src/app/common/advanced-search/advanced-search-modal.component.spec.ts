import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchComponent } from './advanced-search-modal.component';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { TierContextService } from 'src/app/services/tier-context.service';

export class TestType {
  id: number;
  name: string;
}

describe('AdvancedSearchModalComponent', () => {
  let component: AdvancedSearchComponent<TestType>;
  let fixture: ComponentFixture<AdvancedSearchComponent<TestType>>;
  let ngxSmartModalService: NgxSmartModalService;
  let tierContextService: any;
  let advancedSearchAdapterSubject: Subject<any>;
  let advancedSearchAdapter: any;

  beforeEach(async(() => {
    tierContextService = {
      currentTier: of({ id: '' }),
    };

    ngxSmartModalService = {
      open: jest.fn(),
      close: jest.fn(),
      getModal: jest.fn().mockReturnValue({
        setData: jest.fn(),
        open: jest.fn(),
        close: jest.fn(),
        onAnyCloseEventFinished: jest.fn().mockReturnValue(of({})),
      }),
      resetModalData: jest.fn(),
    } as any;

    advancedSearchAdapter = {
      getMany: jest.fn(),
    };

    advancedSearchAdapterSubject = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [AdvancedSearchComponent, MockNgxSmartModalComponent],
      imports: [FormsModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule],
      providers: [
        { provide: NgxSmartModalService, useValue: ngxSmartModalService },
        { provide: TierContextService, useValue: tierContextService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchComponent);
    component = fixture.componentInstance;
    component.advancedSearchAdapterSubject = advancedSearchAdapterSubject;
    component.formInputs = [{ propertyName: 'test', displayName: 'Test' }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset modal data and build form on reset', () => {
    const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');
    const buildFormSpy = jest.spyOn(component, 'buildForm');

    component.reset();

    expect(resetModalDataSpy).toHaveBeenCalledWith('advancedSearch');
    expect(buildFormSpy).toHaveBeenCalled();
  });

  it('should close modal, reset, and build form on closeModal', () => {
    const closeSpy = jest.spyOn(ngxSmartModalService, 'close');
    const resetSpy = jest.spyOn(component, 'reset');
    const buildFormSpy = jest.spyOn(component, 'buildForm');

    component.closeModal();

    expect(closeSpy).toHaveBeenCalledWith('advancedSearch');
    expect(resetSpy).toHaveBeenCalled();
    expect(buildFormSpy).toHaveBeenCalled();
  });

  it('should reset modal data on onOpen', () => {
    const resetModalDataSpy = jest.spyOn(ngxSmartModalService, 'resetModalData');
    component.onOpen();
    expect(resetModalDataSpy).toHaveBeenCalledWith('advancedSearch');
  });

  it('should return form controls', () => {
    const controls = component.f;
    expect(controls).toBe(component.form.controls);
  });

  describe('searchThis', () => {
    it('should call advancedSearchOr when orActive is true', () => {
      const advancedSearchOrSpy = jest.spyOn(component, 'advancedSearchOr');
      component.orActive = true;
      component.searchThis();
      expect(advancedSearchOrSpy).toHaveBeenCalled();
    });

    it('should call advancedSearchAnd when orActive is false', () => {
      const advancedSearchAndSpy = jest.spyOn(component, 'advancedSearchAnd');
      component.orActive = false;
      component.searchThis();
      expect(advancedSearchAndSpy).toHaveBeenCalled();
    });
  });

  it('should build OR search parameters, get data, and close modal in advancedSearchOr', () => {
    advancedSearchAdapterSubject.next(advancedSearchAdapter);

    const advancedSearchAdapterSpy = jest.spyOn(component.advancedSearchAdapter, 'getMany');
    jest.spyOn(component, 'closeModal');
    const mockData = { data: 'mockData' };
    const mockSubscribe = { subscribe: jest.fn() } as any;
    jest.spyOn(component.advancedSearchResults, 'emit');

    advancedSearchAdapterSpy.mockReturnValue(mockSubscribe);
    mockSubscribe.subscribe.mockImplementation(callback => callback(mockData));

    component.currentTier = { id: '1' } as any;
    component.formInputs = [
      { propertyName: 'name', searchOperator: 'eq' } as any,
      { propertyName: 'ipAddress', searchOperator: 'eq' } as any,
    ];
    component.form = new FormBuilder().group({
      name: 'testName',
      ipAddress: '192.168.0.1',
    });

    component.advancedSearchOr();

    expect(advancedSearchAdapterSpy).toHaveBeenCalledWith({
      s: '{"tierId": {"$eq": "1"}, "$or": [{"name": {"$eq": "testName"}},{"ipAddress": {"$eq": "192.168.0.1"}}]}',
      page: 1,
      limit: 20,
      sort: ['name,ASC'],
    });
    expect(component.closeModal).toHaveBeenCalled();
    expect(component.advancedSearchResults.emit).toHaveBeenCalledWith(mockData);
  });

  it('should build AND search parameters, get data, and close modal in advancedSearchAnd', () => {
    advancedSearchAdapterSubject.next(advancedSearchAdapter);

    jest.spyOn(component.advancedSearchResults, 'emit');
    const advancedSearchAdapterSpy = jest.spyOn(component.advancedSearchAdapter, 'getMany');
    jest.spyOn(component, 'closeModal');
    const mockData = { data: 'mockData' };
    const mockSubscribe = { subscribe: jest.fn() } as any;

    advancedSearchAdapterSpy.mockReturnValue(mockSubscribe);
    mockSubscribe.subscribe.mockImplementation(callback => callback(mockData));

    component.currentTier = { id: '1' } as any;
    component.formInputs = [
      { propertyName: 'name', searchOperator: 'eq' } as any,
      { propertyName: 'ipAddress', searchOperator: 'eq' } as any,
    ];
    component.form = new FormBuilder().group({
      name: 'testName',
      ipAddress: '192.168.0.1',
    });

    component.advancedSearchAnd();

    expect(advancedSearchAdapterSpy).toHaveBeenCalledWith({
      filter: ['tierId||eq||1', 'name||eq||testName', 'ipAddress||eq||192.168.0.1'],
      page: 1,
      limit: 20,
      sort: ['name,ASC'],
    });
    expect(component.closeModal).toHaveBeenCalled();
    expect(component.advancedSearchResults.emit).toHaveBeenCalledWith(mockData);
  });
});
