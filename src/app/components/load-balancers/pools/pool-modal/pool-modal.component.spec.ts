import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PoolModalComponent } from './pool-modal.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockNgxSmartModalComponent,
  MockIconButtonComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import {
  LoadBalancerPool,
  LoadBalancerPoolLoadBalancingMethod,
  V1LoadBalancerHealthMonitorsService,
  V1LoadBalancerNodesService,
  V1LoadBalancerPoolsService,
} from 'api_client';
import TestUtil from 'src/test/TestUtil';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { PoolModalDto } from './pool-modal.dto';

describe('PoolModalComponent', () => {
  let component: PoolModalComponent;
  let fixture: ComponentFixture<PoolModalComponent>;
  let ngx: NgxSmartModalService;
  let service: V1LoadBalancerPoolsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        PoolModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1LoadBalancerHealthMonitorsService),
        MockProvider(V1LoadBalancerNodesService),
        MockProvider(V1LoadBalancerPoolsService),
      ],
    });

    fixture = TestBed.createComponent(PoolModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    ngx = TestBed.inject(NgxSmartModalService);
    service = TestBed.inject(V1LoadBalancerPoolsService);
  });

  const createPool = (): LoadBalancerPool => {
    return {
      defaultHealthMonitors: [],
      healthMonitors: [],
      id: '2',
      loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.DynamicRatioMember,
      name: 'Pool2',
      nodes: [],
      tierId: '1',
    };
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.f.name)).toBe(true);
  });

  it('name and loadBalancingMethod should be required', () => {
    const fields = ['name', 'loadBalancingMethod'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('servicePort and ratio should be required when editing and adding a node', () => {
    component.modalMode = ModalMode.Edit;
    component.f.selectedNode.setValue({ id: '1' });

    const fields = ['servicePort', 'ratio'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('should disable name when editing an existing pool', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: PoolModalDto = {
        tierId: '1',
        pool: createPool(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.loadBalancingMethod.disabled).toBe(false);
  });

  it('should create a new pool', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerPoolsPost');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: PoolModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.PredictiveMember,
      name: 'NewName',
      ratio: null,
      selectedHealthMonitor: null,
      selectedNode: null,
      servicePort: null,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerPool: {
        defaultHealthMonitors: [],
        healthMonitors: [],
        name: 'NewName',
        loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.PredictiveMember,
        tierId: '1',
      },
    });
  });

  it('should update an existing pool', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerPoolsIdPut');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: PoolModalDto = {
        tierId: '1',
        pool: createPool(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.PredictiveMember,
      name: 'New Name',
      ratio: null,
      selectedHealthMonitor: null,
      selectedNode: null,
      servicePort: null,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerPool: {
        defaultHealthMonitors: [],
        healthMonitors: [],
        loadBalancingMethod: LoadBalancerPoolLoadBalancingMethod.PredictiveMember,
        name: 'New Name',
        tierId: null,
      },
    });
  });
});
