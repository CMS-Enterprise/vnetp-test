import { ComponentFixture, TestBed } from '@angular/core/testing';

import { F5ConfigCardComponent } from './f5-config-card.component';
import { ActivatedRoute, Router } from '@angular/router';
import { F5ConfigService } from '../f5-config.service';
import { RuntimeDataService } from '../../../services/runtime-data.service';
import { V1RuntimeDataF5ConfigService } from '../../../../../client';
import { MockFontAwesomeComponent } from '../../../../test/mock-components';

describe('F5ConfigCardComponent', () => {
  let component: F5ConfigCardComponent;
  let fixture: ComponentFixture<F5ConfigCardComponent>;
  let mockF5ConfigStateManagementService: any;
  let mockRouter: any;
  let mockActivatedRoute: any;

  beforeEach(() => {
    mockF5ConfigStateManagementService = {
      calculateTimeDifference: jest.fn().mockReturnValue('1'),
      isRecentlyRefreshed: jest.fn().mockReturnValue(false),
      changeF5Config: jest.fn(),
    };
    mockRouter = {
      navigate: jest.fn(),
    };
    mockActivatedRoute = {
      snapshot: {
        queryParams: { testParam: 'test' },
      },
    };
    TestBed.configureTestingModule({
      declarations: [F5ConfigCardComponent, MockFontAwesomeComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: F5ConfigService, useValue: jest.fn() },
        { provide: RuntimeDataService, useValue: mockF5ConfigStateManagementService },
        { provide: V1RuntimeDataF5ConfigService, useValue: jest.fn() },
      ],
    });
    fixture = TestBed.createComponent(F5ConfigCardComponent);
    component = fixture.componentInstance;
    component.f5Config = {
      data: {
        hostInfo: {
          softwareVersion: 1,
          highAvailabilityStatus: 'available',
        },
      },
      hostname: 'hostname',
      runtimeDataLastRefreshed: new Date(),
    } as any;
    fixture.detectChanges();
  });

  it('should initialize properties correctly', () => {
    expect(component.softwareVersion).toEqual(1);
    expect(component.highAvailabilityStatus).toEqual('available');
    expect(component.hostName).toEqual('hostname');
    expect(component.lastRefreshed).toBeDefined();
    expect(component.lastRefreshed).toEqual('1');
  });

  describe('navigateToDetails', () => {
    it('should navigate to the details page with correct parameters', () => {
      component.navigateToDetails();

      expect(mockF5ConfigStateManagementService.changeF5Config).toHaveBeenCalledWith(component.f5Config);
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/netcentric/f5-config/partitions', component.f5Config.hostname], {
        relativeTo: mockActivatedRoute,
        queryParams: mockActivatedRoute.snapshot.queryParams,
      });
    });
  });
});
