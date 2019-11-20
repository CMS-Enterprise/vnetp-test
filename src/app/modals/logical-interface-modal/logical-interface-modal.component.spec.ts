import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { LogicalInterfaceModalComponent } from './logical-interface-modal.component';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { NgxSmartModalServiceStub } from '../modal-mock';

describe('LogicalInterfaceModalComponent', () => {
  let component: LogicalInterfaceModalComponent;
  let fixture: ComponentFixture<LogicalInterfaceModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        NgxSmartModalModule,
        ReactiveFormsModule,
        AngularFontAwesomeModule,
        NgxMaskModule.forRoot(),
      ],
      declarations: [LogicalInterfaceModalComponent, TooltipComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
      ],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(LogicalInterfaceModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LogicalInterfaceModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('user should not be able to add native vlan as tagged vlan', () => {
    const nativeSubnet = component.form.controls.nativeSubnet;
    nativeSubnet.setValue('Test1');

    const selectedTaggedSubnet = component.form.controls.selectedTaggedSubnet;
    selectedTaggedSubnet.setValue('Test1');
    component.selectSubnet();

    expect(component.selectedSubnets.length).toBeFalsy();
  });

  // Initial Form State
  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('native vlan should be required', () => {
    const nativeSubnet = component.form.controls.nativeSubnet;
    expect(nativeSubnet.valid).toBeFalsy();
  });
});
