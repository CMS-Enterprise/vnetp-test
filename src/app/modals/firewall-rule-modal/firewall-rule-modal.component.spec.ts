// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { FirewallRuleModalComponent } from './firewall-rule-modal.component';

describe('FirewallRuleModalComponent', () => {
  let component: FirewallRuleModalComponent;
  let fixture: ComponentFixture<FirewallRuleModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot()],
      declarations: [ FirewallRuleModalComponent ],
      providers: [ { provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators]
    })
    .compileComponents().then(() => {
      fixture = TestBed.createComponent(FirewallRuleModalComponent);
      component = fixture.componentInstance;
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRuleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Initial Form State
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it ('name should be required', () =>  {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it ('action should be required', () =>  {
    const action = component.form.controls.action;
    expect(action.valid).toBeFalsy();
  });

  it ('sourceIp should be required', () =>  {
    const sourceIp = component.form.controls.sourceIp;
    expect(sourceIp.valid).toBeFalsy();
  });

  it ('sourcePorts should be required', () =>  {
    const sourcePorts = component.form.controls.sourcePorts;
    expect(sourcePorts.valid).toBeFalsy();
  });

  it('destinationIp should be required', () => {
    const destinationIp = component.form.controls.destinationIp;
    expect(destinationIp.valid).toBeFalsy();
  });

  it ('destinationPorts should be required', () =>  {
    const destinationPorts = component.form.controls.destinationPorts;
    expect(destinationPorts.valid).toBeFalsy();
  });

});
