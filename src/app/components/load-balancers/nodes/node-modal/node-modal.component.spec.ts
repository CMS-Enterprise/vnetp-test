import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NodeModalComponent } from './node-modal.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1LoadBalancerPoolsService, V1LoadBalancerNodesService, LoadBalancerNodeTypeEnum, LoadBalancerNode } from 'client';
import TestUtil from 'src/test/TestUtil';
import { NodeModalDto } from './node-modal.dto';

describe('NodeModalComponent', () => {
  let component: NodeModalComponent;
  let fixture: ComponentFixture<NodeModalComponent>;
  let service: V1LoadBalancerNodesService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [NodeModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerPoolsService), MockProvider(V1LoadBalancerNodesService)],
    });
    fixture = TestBed.createComponent(NodeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerNodesService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createNode = (): LoadBalancerNode => {
    return {
      tierId: '1',
      id: '2',
      name: 'Node2',
      autoPopulate: true,
      fqdn: 'www.google.com',
      ipAddress: null,
      type: LoadBalancerNodeTypeEnum.Fqdn,
    };
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.form.controls.name)).toBe(true);
  });

  it('name and type should be required', () => {
    const fields = ['name', 'type'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('ipAddress, fqdn and auto populate should be optional', () => {
    const fields = ['ipAddress', 'fqdn', 'autoPopulate'];
    expect(TestUtil.areOptionalFields(component.form, fields)).toBe(true);
  });

  it('ipAddress should be required when type is "IpAddress"', () => {
    const { type } = component.f;
    type.setValue(LoadBalancerNodeTypeEnum.IpAddress);

    expect(TestUtil.isFormControlRequired(component.f.ipAddress)).toBe(true);
  });

  it('fqdn should be required when type is "Fqdn"', () => {
    const { type } = component.f;
    type.setValue(LoadBalancerNodeTypeEnum.Fqdn);

    expect(TestUtil.isFormControlRequired(component.f.fqdn)).toBe(true);
  });

  it('should disable name when editing an existing node', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: NodeModalDto = {
        tierId: '1',
        node: createNode(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.ipAddress.disabled).toBe(false);
    expect(component.form.controls.fqdn.disabled).toBe(false);
    expect(component.form.controls.autoPopulate.disabled).toBe(false);
    expect(component.form.controls.type.disabled).toBe(false);
  });

  it('should create a new node', () => {
    const spy = jest.spyOn(service, 'createOneLoadBalancerNode');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: NodeModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      autoPopulate: false,
      fqdn: null,
      ipAddress: null,
      name: 'Node1',
      type: LoadBalancerNodeTypeEnum.IpAddress,
    });
    component.f.ipAddress.setValue('192.168.1.1');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerNode: {
        autoPopulate: null,
        fqdn: null,
        ipAddress: '192.168.1.1',
        name: 'Node1',
        tierId: '1',
        type: LoadBalancerNodeTypeEnum.IpAddress,
      },
    });
  });

  it('should update an existing node', () => {
    const spy = jest.spyOn(service, 'updateOneLoadBalancerNode');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: NodeModalDto = {
        tierId: '1',
        node: createNode(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      autoPopulate: false,
      fqdn: null,
      ipAddress: null,
      name: 'NewName',
      type: LoadBalancerNodeTypeEnum.IpAddress,
    });
    component.f.ipAddress.setValue('192.168.1.2');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerNode: {
        autoPopulate: null,
        fqdn: null,
        ipAddress: '192.168.1.2',
        name: undefined,
        tierId: null,
        type: LoadBalancerNodeTypeEnum.IpAddress,
      },
    });
  });
});
