import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { TierSelectComponent } from './tier-select.component';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgSelectModule } from '@ng-select/ng-select';
import { MockProvider } from 'src/test/mock-providers';
import { ToastrService } from 'ngx-toastr';
import { of } from 'rxjs';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { AuthService } from 'src/app/services/auth.service';
import { TierContextService } from 'src/app/services/tier-context.service';
import { V1DatacentersService } from 'client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { By } from '@angular/platform-browser';

describe('TierSelectComponent', () => {
  let component: TierSelectComponent;
  let fixture: ComponentFixture<TierSelectComponent>;

  beforeEach(() => {
    const authService = {
      currentUser: of({}),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, NgSelectModule],
      declarations: [TierSelectComponent, MockNgxSmartModalComponent],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(ToastrService),
        MockProvider(V1DatacentersService),
        { provide: AuthService, useValue: authService },
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(TierSelectComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    // const datacenterService = TestBed.inject(V1DatacentersService);
    // const datacenterSpy = jest.spyOn(datacenterService, 'getOneDatacenters').mockImplementation(() => {
    //   return of({});
    // });

    expect(component).toBeTruthy();
  });

  it('should open the tier modal when clicked', () => {
    const ngx = TestBed.inject(NgxSmartModalService) as any;
    const openSpy = jest.fn();
    jest.spyOn(ngx, 'getModal').mockImplementation(() => ({
      open: openSpy,
    }));

    const openButton = fixture.debugElement.query(By.css('button'));
    openButton.nativeElement.click();

    expect(openSpy).toHaveBeenCalled();
  });

  it('should switch tiers', () => {
    const tierContextService = TestBed.inject(TierContextService);
    const toastrService = TestBed.inject(ToastrService);
    jest.spyOn(tierContextService, 'switchTier').mockImplementation(() => true);
    const successSpy = jest.spyOn(toastrService, 'success');

    component.selectedTier = '1';
    component.switchTier();

    expect(successSpy).toHaveBeenCalled();
  });

  it('should not switch tiers when an error occurs', () => {
    const tierContextService = TestBed.inject(TierContextService);
    jest.spyOn(tierContextService, 'switchTier').mockImplementation(() => false);

    const toastrService = TestBed.inject(ToastrService);
    const successSpy = jest.spyOn(toastrService, 'success');

    component.selectedTier = '1';
    component.switchTier();

    expect(successSpy).not.toHaveBeenCalled();
  });
});
