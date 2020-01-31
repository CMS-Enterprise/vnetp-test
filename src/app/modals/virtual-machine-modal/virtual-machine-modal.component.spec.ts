import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualMachineModalComponent } from './virtual-machine-modal.component';
import {
  NgxSmartModalComponent,
  NgxSmartModalModule,
  NgxSmartModalService,
} from 'ngx-smart-modal';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { NgxSmartModalServiceStub } from '../modal-mock';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('VirtualMachineModalComponent', () => {
  let component: VirtualMachineModalComponent;
  let fixture: ComponentFixture<VirtualMachineModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        NgxMaskModule.forRoot(),
        HttpClientTestingModule,
      ],
      declarations: [VirtualMachineModalComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualMachineModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
