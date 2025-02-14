/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { AppcentricNavbarComponent } from './appcentric-navbar.component';
import { of } from 'rxjs';

describe('AppcentricNavbarComponent', () => {
  let component: AppcentricNavbarComponent;
  let fixture: ComponentFixture<AppcentricNavbarComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientModule],
      declarations: [AppcentricNavbarComponent, FilterPipe, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), AuthService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(AppcentricNavbarComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
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
    const mockResponse = jest.fn();
    Object.defineProperty(window, 'location', {
      value: {
        hash: {
          endsWith: mockResponse,
          includes: mockResponse,
        },
        assign: mockResponse,
      },
      writable: true,
    });
    it('should close the logoutModal and call auth.logout', () => {
      jest.spyOn(component['ngx'], 'close');
      jest.spyOn(component['auth'], 'logout');
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
