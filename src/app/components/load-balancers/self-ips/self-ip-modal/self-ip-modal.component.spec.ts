import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { SelfIpModalComponent } from './self-ip-modal.component';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerSelfIp, LoadBalancerVlan, V1LoadBalancerSelfIpsService, V1LoadBalancerVlansService, V1TiersService } from 'client';
import TestUtil from 'src/test/TestUtil';
import { SelfIpModalDto } from './self-ip-modal.dto';

describe('SelfIpModalComponent', () => {
  let component: SelfIpModalComponent;
  let fixture: ComponentFixture<SelfIpModalComponent>;
  let service: V1LoadBalancerSelfIpsService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [SelfIpModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1LoadBalancerSelfIpsService),
        MockProvider(V1LoadBalancerVlansService),
        MockProvider(V1TiersService),
      ],
    });

    fixture = TestBed.createComponent(SelfIpModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    component.availableVlans = [{ id: '3', name: 'VLAN3' }] as LoadBalancerVlan[];

    service = TestBed.inject(V1LoadBalancerSelfIpsService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createSelfIp = (): LoadBalancerSelfIp => ({
    tierId: '1',
    id: '2',
    name: 'SelfIp2',
    ipAddress: '192.168.1.1',
    loadBalancerVlanId: '3',
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.f.name)).toBe(true);
  });

  it('name, ipAddress and loadBalancerVlanId should be required', () => {
    const fields = ['name', 'ipAddress', 'loadBalancerVlanId'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('name and ipAddress should be disabled when editing an existing self ip', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: SelfIpModalDto = {
        tierId: '1',
        selfIp: createSelfIp(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.ipAddress.disabled).toBe(true);
    expect(component.form.controls.loadBalancerVlanId.disabled).toBe(true);
  });

  it('should create a new self ip', () => {
    const spy = jest.spyOn(service, 'createOneLoadBalancerSelfIp');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: SelfIpModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      ipAddress: '192.168.1.2',
      loadBalancerVlanId: '3',
      name: 'NewName',
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerSelfIp: {
        ipAddress: '192.168.1.2',
        loadBalancerVlanId: '3',
        name: 'NewName',
        tierId: '1',
      },
    });
  });

  it('should update an existing self ip', () => {
    const spy = jest.spyOn(service, 'updateOneLoadBalancerSelfIp');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: SelfIpModalDto = {
        tierId: '1',
        selfIp: createSelfIp(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      ipAddress: '192.168.1.2',
      loadBalancerVlanId: '3',
      name: 'NewName',
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerSelfIp: {
        loadBalancerVlanId: '3',
        ipAddress: '192.168.1.2',
        name: 'NewName',
      },
    });
  });
});
