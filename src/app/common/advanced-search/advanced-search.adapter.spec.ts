/* tslint:disable:no-string-literal */

import { AdvancedSearchAdapter } from './advanced-search.adapter';
import { of } from 'rxjs';

describe('AdvancedSearchAdapter', () => {
  let adapter: AdvancedSearchAdapter<any>;
  let mockService: any;
  let mockData: any;
  let mockServiceName;

  beforeEach(() => {
    adapter = new AdvancedSearchAdapter<any>();
    mockService = {
      getManyWithPagination: jest.fn(),
      findAll: jest.fn(),
    };
    mockServiceName = 'mockService';
    mockData = { data: [], count: 0, total: 0, page: 0, pageCount: 0 };
    adapter.setService(mockService);
    adapter.setServiceName(mockServiceName);
  });

  it('should set service correctly', () => {
    expect(adapter['service']).toEqual(mockService);
  });

  it('should set method name correctly', () => {
    const methodName = 'getManyWithPagination';
    adapter.setMethodName(methodName);
    expect(adapter.methodName).toEqual(methodName);
  });

  it('should call service getManyWithPagination method with correct params in getMany', () => {
    class MockService {
      getManyWithPagination() {}
    }
    MockService.prototype.getManyWithPagination = jest.fn(() => of(mockData));
    const mockServiceInstance = new MockService();
    adapter.setService(mockServiceInstance);

    const params = { perPage: 10, page: 1 };
    adapter.getMany(params).subscribe(data => {
      expect(mockServiceInstance.getManyWithPagination).toHaveBeenCalledWith(params);
      expect(data).toEqual(mockData);
    });
  });

  it('should correctly determine the method name in getMethodName', () => {
    class MockService {
      getManyWithPagination() {}
    }

    const mockServiceInstance = new MockService();
    adapter.setService(mockServiceInstance);

    expect(adapter.getMethodName('getMany')).toEqual('getManyWithPagination');
  });
});
