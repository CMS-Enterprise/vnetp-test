import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { NetworksDetailComponent } from './networks-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { IpaddressesComponent } from '../../ipaddresses/ipaddresses.component';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';

describe('NetworksDetailComponent', () => {
  let component: NetworksDetailComponent;
  let fixture: ComponentFixture<NetworksDetailComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        RouterTestingModule.withRoutes([]),
        NgxSmartModalModule,
        HttpClientTestingModule,
      ],
      declarations: [
        NetworksDetailComponent,
        IpaddressesComponent,
        TooltipComponent,
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        CookieService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworksDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
