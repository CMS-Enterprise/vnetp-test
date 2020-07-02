import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientModule } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { FormsModule, FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { FilterPipe } from './pipes/filter.pipe';
import { ToastrModule } from 'ngx-toastr';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { DatacenterSelectComponent } from './common/datacenter-select/datacenter-select.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { BreadcrumbComponent } from './common/breadcrumb/breadcrumb.component';
import { NetworkObjectModalComponent } from './components/network-objects-groups/network-object-modal/network-object-modal.component';
import { NetworkObjectGroupModalComponent } from './components/network-objects-groups/network-object-group-modal/network-object-group-modal.component';
import { ServiceObjectModalComponent } from './components/service-objects-groups/service-object-modal/service-object-modal.component';
import { ServiceObjectGroupModalComponent } from './components/service-objects-groups/service-object-group-modal/service-object-group-modal.component';

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
