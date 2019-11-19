// FIXME: Need to write mock for ngxSmartModal.
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import {
  FormsModule,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { FirewallRuleModalComponent } from './firewall-rule-modal.component';
import { CookieService } from 'ngx-cookie-service';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TooltipComponent } from 'src/app/components/tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('FirewallRuleModalComponent', () => {
  let component: FirewallRuleModalComponent;
  let fixture: ComponentFixture<FirewallRuleModalComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

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
      declarations: [FirewallRuleModalComponent, TooltipComponent],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        FormBuilder,
        Validators,
        CookieService,
      ],
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
    const log = component.form.controls.log;
    expect(log.valid).toBeTruthy();
  });

  it('direction should be required', () => {
    const direction = component.form.controls.direction;
    expect(direction.valid).toBeFalsy();
  });

  it('sourceNetworkType should not be required and should have default value ip', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    expect(sourceNetworkType.valid).toBeTruthy();
    expect(sourceNetworkType.value === 'ip').toBeTruthy();
  });

  it('sourceIp should be required', () => {
    const sourceIp = component.form.controls.sourceIp;
    expect(sourceIp.valid).toBeFalsy();
  });

  it('sourceNetworkObject should not be required', () => {
    const sourceNetworkObject = component.form.controls.sourceNetworkObject;
    expect(sourceNetworkObject.valid).toBeTruthy();
  });

  it('sourceNetworkObjectGroup should not be required', () => {
    const sourceNetworkObjectGroup =
      component.form.controls.sourceNetworkObjectGroup;
    expect(sourceNetworkObjectGroup.valid).toBeTruthy();
  });

  it('sourceServiceType should not be required and should have default value port', () => {
    const sourceServiceType = component.form.controls.sourceServiceType;
    expect(sourceServiceType.valid).toBeTruthy();
    expect(sourceServiceType.value === 'port').toBeTruthy();
  });

  it('sourcePorts should be required', () => {
    const sourcePorts = component.form.controls.sourcePorts;
    expect(sourcePorts.valid).toBeFalsy();
  });

  it('sourceServiceObject should not required', () => {
    const sourceServiceObject = component.form.controls.sourceServiceObject;
    expect(sourceServiceObject.valid).toBeTruthy();
  });

  it('sourceServiceObjectGroup should not be required', () => {
    const sourceServiceObjectGroup =
      component.form.controls.sourceServiceObjectGroup;
    expect(sourceServiceObjectGroup.valid).toBeTruthy();
  });

  it('destinationNetworkType should not be required and should have default value ip', () => {
    const destinationNetworkType =
      component.form.controls.destinationNetworkType;
    expect(destinationNetworkType.valid).toBeTruthy();
    expect(destinationNetworkType.value === 'ip').toBeTruthy();
  });

  it('destinationIp should be required', () => {
    const destinationIp = component.form.controls.destinationIp;
    expect(destinationIp.valid).toBeFalsy();
  });

  it('destinationNetworkObject should not be required', () => {
    const destinationNetworkObject =
      component.form.controls.destinationNetworkObject;
    expect(destinationNetworkObject.valid).toBeTruthy();
  });

  it('destinationNetworkObjectGroup should not be required', () => {
    const destinationNetworkObjectGroup =
      component.form.controls.destinationNetworkObjectGroup;
    expect(destinationNetworkObjectGroup.valid).toBeTruthy();
  });

  it('destinationServiceType should not be required and should have default value port', () => {
    const destinationServiceType =
      component.form.controls.destinationServiceType;
    expect(destinationServiceType.valid).toBeTruthy();
    expect(destinationServiceType.value === 'port').toBeTruthy();
  });

  it('destinationPorts should be required', () => {
    const destinationPorts = component.form.controls.destinationPorts;
    expect(destinationPorts.valid).toBeFalsy();
  });

  it('destinationServiceObject should not required', () => {
    const destinationServiceObject =
      component.form.controls.destinationServiceObject;
    expect(destinationServiceObject.valid).toBeTruthy();
  });

  it('destinationServiceObjectGroup should not be required', () => {
    const destinationServiceObjectGroup =
      component.form.controls.destinationServiceObjectGroup;
    expect(destinationServiceObjectGroup.valid).toBeTruthy();
  });

  it('log should not be required', () => {
    const log = component.form.controls.log;
    expect(log.valid).toBeTruthy();
  });

  // Source Network Type
  it('sourceIp should be required if source network type is ip', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    sourceNetworkType.setValue('ip');
    const sourceIp = component.form.controls.sourceIp;
    expect(sourceIp.valid).toBeFalsy();
  });

  it('sourceNetworkObject should be required if source network type is object', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    sourceNetworkType.setValue('object');
    const sourceServiceObject = component.form.controls.sourceNetworkObject;
    expect(sourceServiceObject.valid).toBeFalsy();
  });

  it('sourceNetworkObject should be required if source network type is objectGroup', () => {
    const sourceNetworkType = component.form.controls.sourceNetworkType;
    sourceNetworkType.setValue('objectGroup');
    const sourceServiceObjectGroup =
      component.form.controls.sourceNetworkObjectGroup;
    expect(sourceServiceObjectGroup.valid).toBeFalsy();
  });

  // Source Service Type
  it('sourcePort should be required if source service type is port', () => {
    const sourceServiceType = component.form.controls.sourceServiceType;
    sourceServiceType.setValue('port');
    const sourcePorts = component.form.controls.sourcePorts;
    expect(sourcePorts.valid).toBeFalsy();
  });

  it('sourceServiceObject should be required if source service type is object', () => {
    const sourceServiceType = component.form.controls.sourceServiceType;
    sourceServiceType.setValue('object');
    const sourceServiceObject = component.form.controls.sourceServiceObject;
    expect(sourceServiceObject.valid).toBeFalsy();
  });

  it('sourceServiceObjectGroup should be required if source service type is objectGroup', () => {
    const sourceServiceType = component.form.controls.sourceServiceType;
    sourceServiceType.setValue('objectGroup');
    const sourceServiceObjectGroup =
      component.form.controls.sourceServiceObjectGroup;
    expect(sourceServiceObjectGroup.valid).toBeFalsy();
  });

  // Destination Network Type
  it('destinationIp should be required if destination network type is ip', () => {
    const destinationNetworkType =
      component.form.controls.destinationNetworkType;
    destinationNetworkType.setValue('ip');
    const destinationIp = component.form.controls.destinationIp;
    expect(destinationIp.valid).toBeFalsy();
  });

  it('destinationNetworkObject should be required if destination network type is object', () => {
    const destinationNetworkType =
      component.form.controls.destinationNetworkType;
    destinationNetworkType.setValue('object');
    const destinationServiceObject =
      component.form.controls.destinationNetworkObject;
    expect(destinationServiceObject.valid).toBeFalsy();
  });

  it('destinationNetworkObject should be required if destination network type is objectGroup', () => {
    const destinationNetworkType =
      component.form.controls.destinationNetworkType;
    destinationNetworkType.setValue('objectGroup');
    const destinationServiceObjectGroup =
      component.form.controls.destinationNetworkObjectGroup;
    expect(destinationServiceObjectGroup.valid).toBeFalsy();
  });

  // Destination Service Type
  it('destinationPort should be required if destination service type is port', () => {
    const destinationServiceType =
      component.form.controls.destinationServiceType;
    destinationServiceType.setValue('port');
    const destinationPorts = component.form.controls.destinationPorts;
    expect(destinationPorts.valid).toBeFalsy();
  });

  it('destinationServiceObject should be required if destination service type is object', () => {
    const destinationServiceType =
      component.form.controls.destinationServiceType;
    destinationServiceType.setValue('object');
    const destinationServiceObject =
      component.form.controls.destinationServiceObject;
    expect(destinationServiceObject.valid).toBeFalsy();
  });

  it('destinationServiceObjectGroup should be required if destination service type is objectGroup', () => {
    const destinationServiceType =
      component.form.controls.destinationServiceType;
    destinationServiceType.setValue('objectGroup');
    const destinationServiceObjectGroup =
      component.form.controls.destinationServiceObjectGroup;
    expect(destinationServiceObjectGroup.valid).toBeFalsy();
  });
});
