import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmwareComponent } from './vmware.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { VirtualMachineModalComponent } from 'src/app/modals/virtual-machine-modal/virtual-machine-modal.component';
import { VirtualDiskModalComponent } from 'src/app/modals/virtual-disk-modal/virtual-disk-modal.component';
import { NetworkAdapterModalComponent } from 'src/app/modals/network-adapter-modal/network-adapter-modal.component';
import { YesNoModalComponent } from 'src/app/modals/yes-no-modal/yes-no-modal.component';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { CookieService } from 'ngx-cookie-service';

describe('VmwareComponent', () => {
  let component: VmwareComponent;
  let fixture: ComponentFixture<VmwareComponent>;
  let router: Router;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        RouterTestingModule.withRoutes([]),
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
      ],
      declarations: [
        VmwareComponent,
        VirtualMachineModalComponent,
        VirtualDiskModalComponent,
        NetworkAdapterModalComponent,
        YesNoModalComponent,
      ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, CookieService, Validators],
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
