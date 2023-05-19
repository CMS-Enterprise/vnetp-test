import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { VlanModalComponent } from './vlan-modal.component';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerVlan, V1LoadBalancerVlansService } from 'client';
import TestUtil from 'src/test/TestUtil';
import { VlanModalDto } from './vlan-modal.dto';

describe('VlanModalComponent', () => {
  let component: VlanModalComponent;
  let fixture: ComponentFixture<VlanModalComponent>;
  let service: V1LoadBalancerVlansService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [VlanModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerVlansService)],
    });

    fixture = TestBed.createComponent(VlanModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerVlansService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createVlan = (): LoadBalancerVlan => ({
    tierId: '1',
    id: '2',
    tag: 3,
    name: 'Vlan2',
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.f.name)).toBe(true);
  });

  it('name and tag should be required', () => {
    const fields = ['name', 'tag'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('name and tag should be disabled when editing an existing virtual server', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: VlanModalDto = {
        tierId: '1',
        vlan: createVlan(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.tag.disabled).toBe(true);
  });

  it('should create a new vlan', () => {
    const spy = jest.spyOn(service, 'createOneLoadBalancerVlan');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: VlanModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      name: 'NewName',
      tag: 5,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerVlan: {
        name: 'NewName',
        tag: 5,
        tierId: '1',
      },
    });
  });

  it('should update an existing vlan', () => {
    const spy = jest.spyOn(service, 'updateOneLoadBalancerVlan');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: VlanModalDto = {
        tierId: '1',
        vlan: createVlan(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      name: 'NewName',
      tag: 5,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerVlan: {
        name: 'NewName',
        tag: 5,
        tierId: null,
      },
    });
  });
});
