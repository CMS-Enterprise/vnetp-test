import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, ActivatedRoute } from '@angular/router';
import { WanForm } from '../../../../../../client';
import { WanFormDetailComponent } from './wan-form-detail.component';

describe('WanFormDetailComponent', () => {
  let component: WanFormDetailComponent;
  let fixture: ComponentFixture<WanFormDetailComponent>;
  let mockRouter: any;
  let mockRoute: any;

  beforeEach(async () => {
    mockRouter = {
      navigate: jest.fn(),
    };

    mockRoute = {
      snapshot: {
        data: { mode: 'netcentric' },
        queryParams: {},
      },
    };

    await TestBed.configureTestingModule({
      declarations: [WanFormDetailComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormDetailComponent);
    component = fixture.componentInstance;
    component.wanForm = { id: 'testWanFormId' } as WanForm;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should set dcsMode from route snapshot data', () => {
      component.ngOnInit();
      expect(component.dcsMode).toBe('netcentric');
    });
  });

  describe('navigateToExternalRoutes', () => {
    it('should navigate to external routes with current query params', () => {
      component.navigateToExternalRoutes();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/netcentric/wan-form', 'testWanFormId', 'external-routes'], {
        relativeTo: mockRoute,
        queryParams: mockRoute.snapshot.queryParams,
        state: { data: component.wanForm },
      });
    });
  });

  describe('navigateToWanFormSubnets', () => {
    it('should navigate to WAN form subnets with current query params', () => {
      component.navigateToWanFormSubnets();
      expect(mockRouter.navigate).toHaveBeenCalledWith(['/netcentric/wan-form', 'testWanFormId', 'wan-form-subnets'], {
        relativeTo: mockRoute,
        queryParams: mockRoute.snapshot.queryParams,
        state: { data: component.wanForm },
      });
    });
  });
});
