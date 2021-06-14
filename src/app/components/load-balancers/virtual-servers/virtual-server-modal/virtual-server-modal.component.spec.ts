import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VirtualServerModalComponent } from './virtual-server-modal.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockIconButtonComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import {
  LoadBalancerVirtualServer,
  LoadBalancerVirtualServerSourceAddressTranslationEnum,
  LoadBalancerVirtualServerTypeEnum,
  V1LoadBalancerPoolsService,
  V1LoadBalancerVirtualServersService,
  V1TiersService,
} from 'client';
import TestUtil from 'src/test/TestUtil';
import { VirtualServerModalDto } from './virtual-server-modal.dto';

describe('VirtualServerModalComponent', () => {
  let component: VirtualServerModalComponent;
  let fixture: ComponentFixture<VirtualServerModalComponent>;
  let service: V1LoadBalancerVirtualServersService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        VirtualServerModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1LoadBalancerPoolsService),
        MockProvider(V1LoadBalancerVirtualServersService),
        MockProvider(V1TiersService),
      ],
    });

    fixture = TestBed.createComponent(VirtualServerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerVirtualServersService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createVirtualServer = (): LoadBalancerVirtualServer => {
    return {
      tierId: '1',
      id: '2',
      destinationIpAddress: '192.168.1.2',
      defaultPoolId: '10bc339d-1ede-7e84-d129-259ef7f0f',
      name: 'VirtualServer2',
      servicePort: 5,
      sourceAddressTranslation: LoadBalancerVirtualServerSourceAddressTranslationEnum.AutoMap,
      sourceIpAddress: '192.168.1.1/11',
      type: LoadBalancerVirtualServerTypeEnum.Standard,
    };
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.f.name)).toBe(true);
  });

  it('name, defaultPoolId, destinationIpAddress, sourceAddressTranslation, sourceIpAddress and type should be required', () => {
    const fields = ['name', 'destinationIpAddress', 'sourceAddressTranslation', 'sourceIpAddress', 'type'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('description should be optional', () => {
    const fields = ['description'];
    expect(TestUtil.areOptionalFields(component.form, fields)).toBe(true);
  });

  it('name and type should be disabled when editing an existing virtual server', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: VirtualServerModalDto = {
        tierId: '1',
        virtualServer: createVirtualServer(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.type.disabled).toBe(true);
  });

  it('should create a new virtual server', () => {
    const spy = jest.spyOn(service, 'createOneLoadBalancerVirtualServer');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: VirtualServerModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      description: 'Description',
      defaultPoolId: '1',
      destinationIpAddress: '192.168.1.2',
      name: 'NewName',
      selectedIRuleId: '1',
      selectedPolicyId: '1',
      selectedProfileId: '1',
      servicePort: 5,
      sourceAddressTranslation: LoadBalancerVirtualServerSourceAddressTranslationEnum.AutoMap,
      sourceIpAddress: '192.168.1.1/11',
      type: LoadBalancerVirtualServerTypeEnum.Standard,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerVirtualServer: {
        description: 'Description',
        defaultPoolId: '1',
        destinationIpAddress: '192.168.1.2',
        name: 'NewName',
        servicePort: 5,
        sourceAddressTranslation: LoadBalancerVirtualServerSourceAddressTranslationEnum.AutoMap,
        sourceIpAddress: '192.168.1.1/11',
        type: LoadBalancerVirtualServerTypeEnum.Standard,
        tierId: '1',
      },
    });
  });

  it('should update an existing virtual server', () => {
    const spy = jest.spyOn(service, 'updateOneLoadBalancerVirtualServer');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: VirtualServerModalDto = {
        tierId: '1',
        virtualServer: createVirtualServer(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      description: 'Description',
      defaultPoolId: '1',
      destinationIpAddress: '192.168.1.2',
      name: 'NewName',
      selectedIRuleId: '1',
      selectedPolicyId: '1',
      selectedProfileId: '1',
      servicePort: 5,
      sourceAddressTranslation: LoadBalancerVirtualServerSourceAddressTranslationEnum.AutoMap,
      sourceIpAddress: '192.168.1.1/11',
      type: LoadBalancerVirtualServerTypeEnum.Standard,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerVirtualServer: {
        description: 'Description',
        defaultPoolId: '1',
        destinationIpAddress: '192.168.1.2',
        name: 'NewName',
        servicePort: 5,
        sourceAddressTranslation: LoadBalancerVirtualServerSourceAddressTranslationEnum.AutoMap,
        sourceIpAddress: '192.168.1.1/11',
        type: LoadBalancerVirtualServerTypeEnum.Standard,
        tierId: null,
      },
    });
  });
});
