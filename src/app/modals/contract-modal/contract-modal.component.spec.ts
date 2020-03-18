import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ContractModalComponent } from './contract-modal.component';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { ExpectedConditions } from 'protractor';
import { NgxSmartModalServiceStub } from '../modal-mock';

describe('ContractModalComponent', () => {
  let component: ContractModalComponent;
  let fixture: ComponentFixture<ContractModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot(), AngularFontAwesomeModule],
      declarations: [ContractModalComponent, TooltipComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ContractModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ContractModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // Initial Form State

  it('form should not be valid', () => {
    expect(component.form.valid).toBeFalsy();
  });

  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('description should not be required', () => {
    const description = component.form.controls.description;
    expect(description.valid).toBeTruthy();
  });

  // Initial Filter Entry Form State

  it('name should be required', () => {
    const name = component.filterEntryForm.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('protocol should be required', () => {
    const protocol = component.filterEntryForm.controls.protocol;
    expect(protocol.valid).toBeFalsy();
  });

  it('source ports should be required', () => {
    const sourcePorts = component.filterEntryForm.controls.sourcePorts;
    expect(sourcePorts.valid).toBeFalsy();
  });

  it('destination ports should be required', () => {
    const destinationPorts = component.filterEntryForm.controls.destinationPorts;
    expect(destinationPorts.valid).toBeFalsy();
  });
});
