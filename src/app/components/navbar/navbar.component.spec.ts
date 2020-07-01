import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService, NgxSmartModalComponent } from 'ngx-smart-modal';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { User } from 'src/app/models/user/user';
import { AutomationApiService } from 'src/app/services/automation-api.service';
import { of } from 'rxjs';
import { By } from '@angular/platform-browser';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let router: Router;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, FormsModule, HttpClientTestingModule],
      declarations: [NavbarComponent, FilterPipe, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [CookieService, { provide: NgxSmartModalService, useValue: ngx }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NavbarComponent);
        component = fixture.componentInstance;
        router = TestBed.get(Router);
        fixture.detectChanges();
      });
  }));

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('getJobs', () => {
    it('should get jobs for the current user', () => {
      component.currentUser = {} as User;

      const automationApiService = TestBed.get(AutomationApiService);
      const getJobsSpy = spyOn(automationApiService, 'getJobs').and.returnValue(of({}));

      component.getJobs();
      expect(getJobsSpy).toHaveBeenCalled();
    });

    it('should not get jobs in there is not a current user', () => {
      component.currentUser = null;

      const automationApiService = TestBed.get(AutomationApiService);
      const getJobsSpy = spyOn(automationApiService, 'getJobs').and.returnValue(of({}));

      component.getJobs();
      expect(getJobsSpy).not.toHaveBeenCalled();
    });
  });
});
