import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VmwareComponent } from './vmware.component';
import {
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockTabsComponent,
  MockComponent,
  MockViewFieldComponent,
} from 'src/test/mock-components';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { CookieService } from 'ngx-cookie-service';
import { NgxPaginationModule } from 'ngx-pagination';
import { MockProvider } from 'src/test/mock-providers';
import { VirtualMachineModalComponent } from './virtual-machine-modal/virtual-machine-modal.component';
import { VirtualDiskModalComponent } from './virtual-disk-modal/virtual-disk-modal.component';
import { NetworkAdapterModalComponent } from './network-adapter-modal/network-adapter-modal.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

describe('VmwareComponent', () => {
  let component: VmwareComponent;
  let fixture: ComponentFixture<VmwareComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule.withRoutes([]),
        FormsModule,
        NgxSmartModalModule,
        NgxPaginationModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
      ],
      declarations: [
        VmwareComponent,
        VirtualMachineModalComponent,
        VirtualDiskModalComponent,
        NetworkAdapterModalComponent,
        YesNoModalComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockTabsComponent,
        MockViewFieldComponent,
        MockComponent({ selector: 'app-priority-group-list', inputs: ['datacenterId'] }),
      ],
      providers: [MockProvider(NgxSmartModalService), FormBuilder, CookieService, Validators],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmwareComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
