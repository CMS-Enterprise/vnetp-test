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

describe('NetworksDetailComponent', () => {
  let component: NetworksDetailComponent;
  let fixture: ComponentFixture<NetworksDetailComponent>;

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
      providers: [CookieService, NgxSmartModalService],
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
