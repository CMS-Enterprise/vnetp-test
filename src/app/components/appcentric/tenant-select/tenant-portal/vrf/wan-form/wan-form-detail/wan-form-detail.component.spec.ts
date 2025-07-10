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

  describe('global setter', () => {
    it('should set global to false when the value is undefined', () => {
      component.global = undefined;
      expect(component.global).toBe(false);
    });

    it('should set global to true when the value is true', () => {
      component.global = true;
      expect(component.global).toBe(true);
    });
  });

  describe('ngOnInit', () => {
    it('should set dcsMode from route snapshot data', () => {
      component.ngOnInit();
      expect(component.dcsMode).toBe('netcentric');
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

  it('should navigate to route table with current query params', () => {
    component.navigateToExternalRoute();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/netcentric/wan-form', 'testWanFormId', 'external-route'], {
      relativeTo: mockRoute,
      queryParams: mockRoute.snapshot.queryParams,
      state: { data: component.wanForm },
    });
  });
});
