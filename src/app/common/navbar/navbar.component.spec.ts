import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from 'src/app/services/auth.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { UserDto } from '../../../../client';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { HttpClientModule } from '@angular/common/http';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NavbarComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      imports: [RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('openLogoutModal', () => {
    beforeEach(() => {
      mockNgxSmartModalService = {
        getModal: jest.fn().mockReturnValue({ open: jest.fn(), close: jest.fn() }),
      };
      component['ngx'] = mockNgxSmartModalService as any;
    });

    it('should open the logoutModal', () => {
      component.openLogoutModal();
      expect(mockNgxSmartModalService.getModal('logoutModal').open).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should close the logoutModal and call auth.logout', () => {
      spyOn(component['ngx'], 'close');
      spyOn(component['auth'], 'logout');
      component.logout();
      expect(component['ngx'].close).toHaveBeenCalledWith('logoutModal');
      expect(component['auth'].logout).toHaveBeenCalled();
    });
  });

  describe('ngOnInit', () => {
    beforeEach(() => {
      mockAuthService = {
        currentUser: of({
          dcsPermissions: [{ tenant: 'testTenant', roles: ['network_ro'] }],
        } as any),
        currentTenant: of('testTenant'),
      };
      component['auth'] = mockAuthService as any;
    });

    it('should set userRoles to ["admin"] for read-only users', () => {
      component.ngOnInit();
      expect(component.userRoles).toEqual(['admin']);
    });
  });
});
