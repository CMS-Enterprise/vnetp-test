// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { FirewallRuleModalComponent } from './firewall-rule-modal.component';
import { CookieService } from 'ngx-cookie-service';
import { MockFontAwesomeComponent, MockTooltipComponent } from 'src/test/mock-components';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgxSmartModalServiceStub } from '../modal-mock';

describe('FirewallRuleModalComponent', () => {
  let component: FirewallRuleModalComponent;
  let fixture: ComponentFixture<FirewallRuleModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, ReactiveFormsModule, NgxMaskModule.forRoot(), HttpClientTestingModule],
      declarations: [FirewallRuleModalComponent, MockTooltipComponent, MockFontAwesomeComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, Validators, CookieService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(FirewallRuleModalComponent);
        component = fixture.componentInstance;
      });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRuleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  // Initial Form State
  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should be required', () => {
    const name = component.form.controls.name;
    expect(name.valid).toBeFalsy();
  });

  it('description should not be required', () => {
    const description = component.form.controls.description;
    expect(description.valid).toBeTruthy();
  });

  it('action should be required', () => {
    const action = component.form.controls.action;
    expect(action.valid).toBeFalsy();
  });

  it('protocol should be required', () => {
    const protocol = component.form.controls.protocol;
    expect(protocol.valid).toBeFalsy();
  });

  it('log should not be required', () => {
    const logging = component.form.controls.logging;
    expect(logging.valid).toBeTruthy();
  });

  it('direction should be required', () => {
    const direction = component.form.controls.direction;
    expect(direction.valid).toBeFalsy();
  });

  it('rule index should be required', () => {
    const ruleIndex = component.form.controls.ruleIndex;
    expect(ruleIndex.valid).toBeFalsy();
  });

  it('sourceNetworkType should not be required and should have default value IpAddress', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    expect(sourceNetworkType.valid).toBeTruthy();
    expect(sourceNetworkType.value === 'IpAddress').toBeTruthy();
  });

  it('sourceIp should be required', () => {
    const sourceIpAddress = component.form.controls.sourceIpAddress;
    expect(sourceIpAddress.valid).toBeFalsy();
  });

  it('sourceNetworkObject should not be required', () => {
    const sourceNetworkObject = component.form.controls.sourceNetworkObject;
    expect(sourceNetworkObject.valid).toBeTruthy();
  });

  it('sourceNetworkObjectGroup should not be required', () => {
    const sourceNetworkObjectGroup = component.form.controls.sourceNetworkObjectGroup;
    expect(sourceNetworkObjectGroup.valid).toBeTruthy();
  });

  it('serviceType should not be required and should have default value Port', () => {
    const serviceType = component.form.controls.serviceType;
    expect(serviceType.valid).toBeTruthy();
    expect(serviceType.value === 'Port').toBeTruthy();
  });

  it('sourcePorts should be required', () => {
    const sourcePorts = component.form.controls.sourcePorts;
    expect(sourcePorts.valid).toBeFalsy();
  });

  it('serviceObject should not required', () => {
    const serviceObject = component.form.controls.serviceObject;
    expect(serviceObject.valid).toBeTruthy();
  });

  it('serviceObjectGroup should not be required', () => {
    const serviceObjectGroup = component.form.controls.serviceObjectGroup;
    expect(serviceObjectGroup.valid).toBeTruthy();
  });

  it('destinationNetworkType should not be required and should have default value IpAddress', () => {
    const destinationNetworkType = component.form.controls.destinationNetworkType;
    expect(destinationNetworkType.valid).toBeTruthy();
    expect(destinationNetworkType.value === 'IpAddress').toBeTruthy();
  });

  it('destinationIp should be required', () => {
    const destinationIpAddress = component.form.controls.destinationIpAddress;
    expect(destinationIpAddress.valid).toBeFalsy();
  });

  it('destinationNetworkObject should not be required', () => {
    const destinationNetworkObject = component.form.controls.destinationNetworkObject;
    expect(destinationNetworkObject.valid).toBeTruthy();
  });

  it('destinationNetworkObjectGroup should not be required', () => {
    const destinationNetworkObjectGroup = component.form.controls.destinationNetworkObjectGroup;
    expect(destinationNetworkObjectGroup.valid).toBeTruthy();
  });

  it('destinationPorts should be required', () => {
    const destinationPorts = component.form.controls.destinationPorts;
    expect(destinationPorts.valid).toBeFalsy();
  });

  it('log should not be required', () => {
    const logging = component.form.controls.logging;
    expect(logging.valid).toBeTruthy();
  });

  // Source Network Type
  it('sourceIp should be required if source network type is ip', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    sourceNetworkType.setValue('IpAddress');
    const sourceIpAddress = component.form.controls.sourceIpAddress;
    expect(sourceIpAddress.valid).toBeFalsy();
  });

  it('sourceNetworkObject should be required if source network type is object', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    sourceNetworkType.setValue('NetworkObject');
    const serviceObject = component.form.controls.sourceNetworkObject;
    expect(serviceObject.valid).toBeFalsy();
  });

  it('sourceNetworkObject should be required if source network type is objectGroup', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    sourceNetworkType.setValue('NetworkObjectGroup');
    const serviceObjectGroup = component.form.controls.sourceNetworkObjectGroup;
    expect(serviceObjectGroup.valid).toBeFalsy();
  });

  // Source Service Type
  it('sourcePort should be required if source service type is port', () => {
    const serviceType = component.form.controls.serviceType;
    serviceType.setValue('Port');
    const sourcePorts = component.form.controls.sourcePorts;
    expect(sourcePorts.valid).toBeFalsy();
  });

  it('serviceObject should be required if source service type is object', () => {
    const serviceType = component.form.controls.serviceType;
    serviceType.setValue('ServiceObject');
    const serviceObject = component.form.controls.serviceObject;
    expect(serviceObject.valid).toBeFalsy();
  });

  it('serviceObjectGroup should be required if source service type is objectGroup', () => {
    const serviceType = component.form.controls.serviceType;
    serviceType.setValue('ServiceObjectGroup');
    const serviceObjectGroup = component.form.controls.serviceObjectGroup;
    expect(serviceObjectGroup.valid).toBeFalsy();
  });

  // Destination Network Type
  it('destinationIp should be required if destination network type is ip', () => {
    const destinationNetworkType = component.form.controls.destinationNetworkType;
    destinationNetworkType.setValue('IpAddress');
    const destinationIpAddress = component.form.controls.destinationIpAddress;
    expect(destinationIpAddress.valid).toBeFalsy();
  });

  it('destinationNetworkObject should be required if destination network type is object', () => {
    const destinationNetworkType = component.form.controls.destinationNetworkType;
    destinationNetworkType.setValue('NetworkObject');
    const serviceObject = component.form.controls.destinationNetworkObject;
    expect(serviceObject.valid).toBeFalsy();
  });

  it('destinationNetworkObject should be required if destination network type is objectGroup', () => {
    const destinationNetworkType = component.form.controls.destinationNetworkType;
    destinationNetworkType.setValue('NetworkObjectGroup');
    const serviceObjectGroup = component.form.controls.destinationNetworkObjectGroup;
    expect(serviceObjectGroup.valid).toBeFalsy();
  });

  // Destination Service Type
  it('destinationPort should be required if destination service type is port', () => {
    const serviceType = component.form.controls.serviceType;
    serviceType.setValue('Port');
    const destinationPorts = component.form.controls.destinationPorts;
    expect(destinationPorts.valid).toBeFalsy();
  });

  // Name validity
  it('name should be valid', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(3));
    expect(name.valid).toBeTruthy();
  });

  it('name should be invalid, min length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(2));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, max length', () => {
    const name = component.form.controls.name;
    name.setValue('a'.repeat(29));
    expect(name.valid).toBeFalsy();
  });

  it('name should be invalid, invalid characters', () => {
    const name = component.form.controls.name;
    name.setValue('invalid/name!');
    expect(name.valid).toBeFalsy();
  });
});
