import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { PolicyModalComponent } from './policy-modal.component';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerPolicy, LoadBalancerPolicyTypeEnum, V1LoadBalancerPoliciesService } from 'client';
import TestUtil from 'src/test/TestUtil';
import { PolicyModalDto } from './policy-modal.dto';

describe('PolicyModalComponent', () => {
  let component: PolicyModalComponent;
  let fixture: ComponentFixture<PolicyModalComponent>;
  let service: V1LoadBalancerPoliciesService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [PolicyModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerPoliciesService)],
    });
    fixture = TestBed.createComponent(PolicyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerPoliciesService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createPolicy = (): LoadBalancerPolicy => {
    return {
      tierId: '1',
      id: '2',
      name: 'Node2',
      type: LoadBalancerPolicyTypeEnum.Apm,
      apmContent: 'APM',
      asmContent: null,
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

  it('asmContent should be required when type is "ASM"', () => {
    const { type } = component.f;
    type.setValue(LoadBalancerPolicyTypeEnum.Asm);
    fixture.detectChanges();

    expect(TestUtil.isFormControlRequired(component.f.asmContent)).toBe(true);
    expect(TestUtil.isFormControlRequired(component.f.apmContent)).toBe(false);
  });

  it('apmContent should be required when type is "APM"', () => {
    const { type } = component.f;
    type.setValue(LoadBalancerPolicyTypeEnum.Apm);
    fixture.detectChanges();

    expect(TestUtil.isFormControlRequired(component.f.apmContent)).toBe(true);
    expect(TestUtil.isFormControlRequired(component.f.asmContent)).toBe(false);
  });

  it('should disable name and type when editing an existing policy', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: PolicyModalDto = {
        tierId: '1',
        policy: createPolicy(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.type.disabled).toBe(true);
    expect(component.form.controls.apmContent.disabled).toBe(false);
    expect(component.form.controls.asmContent.disabled).toBe(false);
  });

  it('should create a new policy', () => {
    const spy = jest.spyOn(service, 'createOneLoadBalancerPolicy');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: PolicyModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      apmContent: null,
      asmContent: null,
      name: 'Node1',
      type: LoadBalancerPolicyTypeEnum.Apm,
    });
    component.f.apmContent.setValue('APM Content');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerPolicy: {
        apmContent: 'APM Content',
        asmContent: null,
        name: 'Node1',
        tierId: '1',
        type: LoadBalancerPolicyTypeEnum.Apm,
      },
    });
  });

  it('should update an existing policy', () => {
    const spy = jest.spyOn(service, 'updateOneLoadBalancerPolicy');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: PolicyModalDto = {
        tierId: '1',
        policy: createPolicy(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      apmContent: null,
      asmContent: null,
      name: 'NewName',
      type: LoadBalancerPolicyTypeEnum.Apm,
    });
    component.f.apmContent.setValue('APM Content');
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerPolicy: {
        apmContent: 'APM Content',
        asmContent: null,
        name: undefined,
        tierId: null,
        type: undefined,
      },
    });
  });
});
