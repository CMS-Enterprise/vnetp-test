import { async, ComponentFixture, TestBed } from '@angular/core/testing';
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
import { V1DatacentersService } from 'api_client';
import { DatacenterContextService } from 'src/app/services/datacenter-context.service';
import { By } from '@angular/platform-browser';

describe('TierSelectComponent', () => {
  let component: TierSelectComponent;
  let fixture: ComponentFixture<TierSelectComponent>;

  beforeEach(async(() => {
    const authService = {
      currentUser: of({}),
    };

    const datacenterService = {
      v1DatacentersIdGet: jest.fn(() => of({ tiers: [] })),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, NgSelectModule],
      declarations: [TierSelectComponent, MockNgxSmartModalComponent],
      providers: [
        MockProvider(DatacenterContextService),
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(ToastrService),
        { provide: V1DatacentersService, useValue: datacenterService },
        { provide: AuthService, useValue: authService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TierSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open the tier modal when clicked', () => {
    const ngx = TestBed.get(NgxSmartModalService);
    const openSpy = jest.fn();
    jest.spyOn(ngx, 'getModal').mockImplementation(() => {
      return {
        open: openSpy,
      };
    });

    const openButton = fixture.debugElement.query(By.css('button'));
    openButton.nativeElement.click();

    expect(openSpy).toHaveBeenCalled();
  });

  it('should switch tiers', () => {
    const toastrService = TestBed.get(ToastrService);
    const successSpy = jest.spyOn(toastrService, 'success');

    component.selectedTier = '1';
    component.switchTier();

    expect(successSpy).toHaveBeenCalled();
  });

  it('should not switch tiers when an error occurs', () => {
    const tierContextService = TestBed.get(TierContextService);
    jest.spyOn(tierContextService, 'switchTier').mockImplementation(() => {
      throw Error();
    });

    const toastrService = TestBed.get(ToastrService);
    const successSpy = jest.spyOn(toastrService, 'success');

    component.selectedTier = '1';
    component.switchTier();

    expect(successSpy).not.toHaveBeenCalled();
  });
});
