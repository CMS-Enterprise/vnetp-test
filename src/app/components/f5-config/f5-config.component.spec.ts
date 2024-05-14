import { ComponentFixture, TestBed } from '@angular/core/testing';

import { F5ConfigComponent } from './f5-config.component';
import { V1RuntimeDataF5ConfigService } from '../../../../client';
import { F5ConfigService } from './f5-config.service';
import { MockComponent } from '../../../test/mock-components';
import { of } from 'rxjs';

describe('F5ConfigComponent', () => {
  let component: F5ConfigComponent;
  let fixture: ComponentFixture<F5ConfigComponent>;
  let mockF5ConfigStateManagementService: any;
  let mockF5ConfigService: any;

  beforeEach(() => {
    mockF5ConfigService = {
      getManyF5Config: jest.fn().mockReturnValue(of('mock data')),
    };
    mockF5ConfigStateManagementService = {
      filterVirtualServers: jest.fn(),
      getF5Configs: jest.fn().mockReturnValue(of('mock data')),
    };
    TestBed.configureTestingModule({
      declarations: [F5ConfigComponent, MockComponent({ selector: 'app-f5-config-filter', inputs: ['showPartitionFilter'] })],
      providers: [
        {
          provide: V1RuntimeDataF5ConfigService,
          useValue: mockF5ConfigService,
        },
        { provide: F5ConfigService, useValue: mockF5ConfigStateManagementService },
      ],
    });
    fixture = TestBed.createComponent(F5ConfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('filterF5Configs', () => {
    it('should filter f5Configs', () => {
      jest.spyOn(component, 'matchF5Config').mockReturnValue(true);
      component.f5Configs = [{ hostname: 'hostname' } as any];
      component.filterF5Configs();
      expect(component.filteredF5Configs).toEqual(component.f5Configs);
    });
  });

  describe('matchF5Config', () => {
    it('should match f5Config when search matches hostname ', () => {
      const f5Config = { hostname: 'hostname', data: { partitionInfo: { partition: [] } } } as any;
      component.searchQuery = 'hostname';
      expect(component.matchF5Config(f5Config)).toBeTruthy();
    });

    it('should match f5Config when search matches partition name', () => {
      mockF5ConfigStateManagementService = {
        filterVirtualServers: jest.fn().mockReturnValue({ partition: [] }),
      } as any;
      (component as any).f5ConfigStateManagementService = mockF5ConfigStateManagementService;
      const f5Config = { hostname: 'hostname', data: { partitionInfo: { partition: [] } } } as any;
      component.searchQuery = 'partition';
      expect(component.matchF5Config(f5Config)).toBeTruthy();
    });

    it('should not match f5Config', () => {
      const f5Config = { hostname: 'hostname', data: { partitionInfo: { partition: [] } } } as any;
      component.searchQuery = 'not found';
      expect(component.matchF5Config(f5Config)).toBeFalsy();
    });

    it('should match f5Config when there is no search', () => {
      const f5Config = { hostname: 'hostname', data: { partitionInfo: { partition: ['partition'] } } } as any;
      component.searchQuery = '';
      expect(component.matchF5Config(f5Config)).toBeTruthy();
    });

    it('should match f5Config when search matches virtual server values', () => {
      mockF5ConfigStateManagementService = {
        filterVirtualServers: jest.fn().mockReturnValue({ partition: ['virtual server'] }),
      } as any;
      (component as any).f5ConfigStateManagementService = mockF5ConfigStateManagementService;
      const f5Config = { hostname: 'hostname', data: { partitionInfo: { partition: ['partition'] } } } as any;
      component.searchQuery = 'virtual server';
      expect(component.matchF5Config(f5Config)).toBeTruthy();
    });
  });

  describe('getF5Configs', () => {
    it('should get f5Configs', () => {
      const filterSpy = jest.spyOn(component, 'filterF5Configs');
      component.getF5Configs();
      expect(mockF5ConfigService.getManyF5Config).toHaveBeenCalled();
      expect(filterSpy).toHaveBeenCalled();
      expect(component.f5Configs).toEqual('mock data');
    });
  });

  describe('onSearch', () => {
    it('should set searchQuery and filter f5Configs', () => {
      const filterSpy = jest.spyOn(component, 'filterF5Configs').mockImplementation();
      component.onSearch('search query');
      expect(component.searchQuery).toEqual('search query');
      expect(filterSpy).toHaveBeenCalled();
    });
  });
});
