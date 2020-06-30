import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NetworkObjectModalComponent } from './modals/network-object-modal/network-object-modal.component';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NetworkObjectGroupModalComponent } from './modals/network-object-group-modal/network-object-group-modal.component';
import { ServiceObjectModalComponent } from './modals/service-object-modal/service-object-modal.component';
import { ServiceObjectGroupModalComponent } from './modals/service-object-group-modal/service-object-group-modal.component';
import { NgxSmartModalServiceStub } from './modals/modal-mock';
import { FilterPipe } from './pipes/filter.pipe';
import { ToastrModule } from 'ngx-toastr';
import { DatacenterSelectComponent } from './components/datacenter-select/datacenter-select.component';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';

const ngx = new NgxSmartModalServiceStub();

describe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        ToastrModule.forRoot({}),
        HttpClientModule,
        FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [
        AppComponent,
        DatacenterSelectComponent,
        NavbarComponent,
        BreadcrumbComponent,
        NetworkObjectModalComponent,
        NetworkObjectGroupModalComponent,
        ServiceObjectModalComponent,
        ServiceObjectGroupModalComponent,
        MockTooltipComponent,
        FilterPipe,
        MockFontAwesomeComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, CookieService, FormBuilder],
    }).compileComponents();
  }));

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
