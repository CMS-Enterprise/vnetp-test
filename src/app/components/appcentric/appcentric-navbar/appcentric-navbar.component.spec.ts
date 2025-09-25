/* eslint-disable */
import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { AppcentricNavbarComponent } from './appcentric-navbar.component';
import { of } from 'rxjs';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

describe('AppcentricNavbarComponent', () => {
  let component: AppcentricNavbarComponent;
  let fixture: ComponentFixture<AppcentricNavbarComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockDialog: Partial<MatDialog>;

  beforeEach(() => {
    mockDialog = {
      open: jest.fn().mockReturnValue({ afterClosed: () => of('cancel') } as any),
    };

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        HttpClientModule,
        MatMenuModule,
        MatToolbarModule,
        MatButtonModule,
        MatIconModule,
        MatDialogModule,
      ],
      declarations: [AppcentricNavbarComponent, FilterPipe, MockFontAwesomeComponent],
      providers: [MockProvider(MatDialog, mockDialog), AuthService],
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
    it('should open the logout dialog', () => {
      component.openLogoutModal();
      expect(mockDialog.open).toHaveBeenCalled();
    });
  });

  describe('logout', () => {
    it('should call auth.logout', () => {
      jest.spyOn(component['auth'], 'logout');
      component.logout();
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
