/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';

import { MockProvider } from 'src/test/mock-providers';
import { AuthService } from 'src/app/services/auth.service';
import { AdminPortalNavbarComponent } from './admin-portal-navbar.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientModule } from '@angular/common/http';

describe('AdminPortalNavbarComponent', () => {
  let component: AdminPortalNavbarComponent;
  let fixture: ComponentFixture<AdminPortalNavbarComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AdminPortalNavbarComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent, MockComponent('app-breadcrumb')],
      providers: [MockProvider(NgxSmartModalService)],
      imports: [HttpClientModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPortalNavbarComponent);
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
});
