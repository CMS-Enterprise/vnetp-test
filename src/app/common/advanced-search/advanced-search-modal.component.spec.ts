import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdvancedSearchComponent } from './advanced-search-modal.component';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { of, Subject } from 'rxjs';
import { TierContextService } from 'src/app/services/tier-context.service';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { NgSelectModule } from '@ng-select/ng-select';

export class TestType {
  constructor() {}
  id: number;
  name: string;
}
const mockActivatedRoute = {
  snapshot: {
    paramMap: convertToParamMap({ id: '7b8f68e5-2d8d-43c4-9fd8-07d521ab34c7' }), // Assuming 'id' is your route parameter name.
  },
};

class AdvancedSearchComponentDummy extends AdvancedSearchComponent<TestType> {}

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
      findAll: jest.fn(),
      service: {} as any,
    };

    advancedSearchAdapterSubject = new Subject<any>();

    TestBed.configureTestingModule({
      declarations: [AdvancedSearchComponentDummy, MockNgxSmartModalComponent],
      imports: [FormsModule, ReactiveFormsModule, HttpClientModule, RouterTestingModule, NgSelectModule],
      providers: [
        { provide: NgxSmartModalService, useValue: ngxSmartModalService },
        { provide: TierContextService, useValue: tierContextService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvancedSearchComponentDummy);
    component = fixture.componentInstance;
    component.advancedSearchAdapterSubject = advancedSearchAdapterSubject;
    component.formInputs = [{ propertyName: 'test', displayName: 'Test' }];
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should close modal', () => {
    const closeSpy = jest.spyOn(ngxSmartModalService, 'close');

    component.closeModal();

    expect(closeSpy).toHaveBeenCalledWith('advancedSearch');
  });

  it('should build form on onOpen', () => {
    const buildFormSpy = jest.spyOn(component, 'buildForm');
    component.onOpen();
    expect(buildFormSpy).toHaveBeenCalled();
  });

  it('should return form controls', () => {
    const controls = component.f;
    expect(controls).toBe(component.form.controls);
  });

  describe('searchThis', () => {
    it('should call advancedSearchOr when orActive is true', () => {
      spyOn(component, 'getBaseSearchProperty').and.returnValue('test');
      spyOn(component, 'getBaseSearchValue').and.returnValue('test');
      const advancedSearchOrSpy = jest.spyOn(component, 'advancedSearchOr');
      component.orActive = true;
      component.searchThis();

      expect(component.getBaseSearchProperty).toHaveBeenCalled();
      expect(component.getBaseSearchValue).toHaveBeenCalled();
      expect(advancedSearchOrSpy).toHaveBeenCalled();
    });

    it('should call advancedSearchAnd when orActive is false', () => {
      spyOn(component, 'getBaseSearchProperty').and.returnValue('test');
      spyOn(component, 'getBaseSearchValue').and.returnValue('test');
      const advancedSearchAndSpy = jest.spyOn(component, 'advancedSearchAnd');
      component.orActive = false;
      component.searchThis();

      expect(component.getBaseSearchProperty).toHaveBeenCalled();
      expect(component.getBaseSearchValue).toHaveBeenCalled();
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

    component.advancedSearchOr('tierId', '1', 1, 20);

    expect(advancedSearchAdapterSpy).toHaveBeenCalledWith({
      s: '{"tierId": {"$eq": "1"}, "$or": [{"name": {"$eq": "testName"}},{"ipAddress": {"$eq": "192.168.0.1"}}]}',
      page: 1,
      limit: 20,
      sort: ['name,ASC'],
    });
    expect(component.closeModal).toHaveBeenCalled();
    expect(component.advancedSearchResults.emit).toHaveBeenCalledWith(mockData);
  });

  it('should build OR search parameters, get appcentric data, and close modal in advancedSearchOr', () => {
    advancedSearchAdapterSubject.next(advancedSearchAdapter);

    const advancedSearchAdapterSpy = jest.spyOn(component.advancedSearchAdapter, 'findAll');
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

    component.advancedSearchOr('tenantId', '1', 1, 20);

    expect(advancedSearchAdapterSpy).toHaveBeenCalledWith({
      s: '{"tenantId": {"$eq": "1"}, "$or": [{"name": {"$eq": "testName"}},{"ipAddress": {"$eq": "192.168.0.1"}}]}',
      page: 1,
      perPage: 20,
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

    component.advancedSearchAnd('tierId', '1', 1, 20);

    expect(advancedSearchAdapterSpy).toHaveBeenCalledWith({
      filter: ['tierId||eq||1', 'name||eq||testName', 'ipAddress||eq||192.168.0.1'],
      page: 1,
      limit: 20,
      sort: ['name,ASC'],
    });
    expect(component.closeModal).toHaveBeenCalled();
    expect(component.advancedSearchResults.emit).toHaveBeenCalledWith(mockData);
  });

  it('should build AND search parameters, get appcentric data, and close modal in advancedSearchAnd', () => {
    advancedSearchAdapterSubject.next(advancedSearchAdapter);

    jest.spyOn(component.advancedSearchResults, 'emit');
    const advancedSearchAdapterSpy = jest.spyOn(component.advancedSearchAdapter, 'findAll');
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

    component.advancedSearchAnd('tenantId', '1', 1, 20);

    expect(advancedSearchAdapterSpy).toHaveBeenCalledWith({
      filter: ['tenantId||eq||1', 'name||eq||testName', 'ipAddress||eq||192.168.0.1'],
      page: 1,
      perPage: 20,
    });
    expect(component.closeModal).toHaveBeenCalled();
    expect(component.advancedSearchResults.emit).toHaveBeenCalledWith(mockData);
  });

  it('should return the service type', () => {
    const testType = new TestType();
    testType.name = 'TestType';
    component.advancedSearchAdapter = advancedSearchAdapter;
    component.advancedSearchAdapter.service = testType;
    const serviceType = component.getServiceType();
    expect(serviceType).toBe('TestType');
  });

  describe('AdvancedSearchModalComponent additional methods', () => {
    // Tests for getBaseSearchProperty method
    it('should return "tierId" as base search property when service type does not include "V2", "FirewallRule", or "NatRule"', () => {
      jest.spyOn(component, 'getServiceType').mockReturnValue('SomeService');
      expect(component.getBaseSearchProperty()).toBe('tierId');
    });

    it('should return "tenantId" as base search property when service type includes "V2"', () => {
      jest.spyOn(component, 'getServiceType').mockReturnValue('SomeServiceV2');
      expect(component.getBaseSearchProperty()).toBe('tenantId');
    });

    it('should return "firewallRuleGroupId" as base search property when service type includes "FirewallRule"', () => {
      jest.spyOn(component, 'getServiceType').mockReturnValue('FirewallRuleService');
      expect(component.getBaseSearchProperty()).toBe('firewallRuleGroupId');
    });

    it('should return "natRuleGroupId" as base search property when service type includes "NatRule"', () => {
      jest.spyOn(component, 'getServiceType').mockReturnValue('NatRuleService');
      expect(component.getBaseSearchProperty()).toBe('natRuleGroupId');
    });

    // Tests for getBaseSearchValue method
    it('should return current tier id as base search value when base search property is "tierId"', () => {
      jest.spyOn(component, 'getBaseSearchProperty').mockReturnValue('tierId');
      expect(component.getBaseSearchValue()).toBe(component.currentTier.id);
    });

    it('should return route snapshot param id as base search value when base search property is not "tierId"', () => {
      jest.spyOn(component, 'getBaseSearchProperty').mockReturnValue('tenantId');
      expect(component.getBaseSearchValue()).toBe('7b8f68e5-2d8d-43c4-9fd8-07d521ab34c7');
    });

    // Tests for isEnum method
    it('should return false when passed object is null', () => {
      expect(component.isEnum(null)).toBeFalsy();
    });

    it('should return false when passed object is undefined', () => {
      expect(component.isEnum(undefined)).toBeFalsy();
    });

    it('should return true when passed object is enum', () => {
      enum TestEnum {
        Test1,
        Test2,
        Test3,
      }
      expect(component.isEnum(TestEnum)).toBeTruthy();
    });

    // Tests for getEnumValues method
    it('should return empty array when passed object is null or undefined', () => {
      expect(component.getEnumValues(null)).toEqual([]);
      expect(component.getEnumValues(undefined)).toEqual([]);
    });

    it('should return enum values when passed object is enum', () => {
      enum TestEnum {
        Test1 = 'Test1',
        Test2 = 'Test2',
        Test3 = 'Test3',
      }
      const numericEnumValues = Object.values(TestEnum);
      expect(component.getEnumValues(TestEnum)).toEqual(numericEnumValues);
    });

    // Tests for showPropertyList method
    it('should return true when property type is enum or boolean', () => {
      enum TestEnum {
        Test1,
        Test2,
        Test3,
      }
      let property = { propertyType: TestEnum } as any;
      expect(component.showPropertyList(property)).toBeTruthy();

      property = { propertyType: 'boolean' } as any;
      expect(component.showPropertyList(property)).toBeTruthy();
    });

    it('should return false when property type is string', () => {
      const property = { propertyType: 'string' } as any;
      expect(component.showPropertyList(property)).toBeFalsy();
    });

    it('should return false when property type is number', () => {
      const property = { propertyType: 'string' } as any;
      expect(component.showPropertyList(property)).toBeFalsy();
    });
  });
});
