import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IRuleModalComponent } from './irule-modal.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerIrule, V1LoadBalancerIrulesService } from 'api_client';
import TestUtil from 'src/test/TestUtil';
import { IRuleModalDto } from './irule-modal.dto';

describe('IRuleModalComponent', () => {
  let component: IRuleModalComponent;
  let fixture: ComponentFixture<IRuleModalComponent>;

  let service: V1LoadBalancerIrulesService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [IRuleModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerIrulesService)],
    });

    fixture = TestBed.createComponent(IRuleModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerIrulesService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createIRule = (): LoadBalancerIrule => {
    return {
      id: '2',
      name: 'iRule2',
      content: 'Content',
      description: 'Description',
      tierId: '1',
    };
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.f.name)).toBe(true);
  });

  it('name and content should be required', () => {
    const requiredFields: (keyof LoadBalancerIrule)[] = ['name', 'content'];
    requiredFields.forEach(f => {
      const control = component.f[f];
      control.setValue(null);
      control.updateValueAndValidity();

      expect(control.valid).toBe(false);
    });
  });

  it('description should be optional', () => {
    const control = component.f.description;
    control.setValue(null);
    control.updateValueAndValidity();

    expect(control.valid).toBe(true);
  });

  it('should disable name when editing an existing iRule', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: IRuleModalDto = {
        tierId: '1',
        iRule: createIRule(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.content.disabled).toBe(false);
    expect(component.form.controls.description.disabled).toBe(false);
  });

  it('should create a new iRule', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerIrulesPost');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: IRuleModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();

    component.form.setValue({
      name: 'iRule1',
      content: 'Content',
      description: 'Description',
    });
    component.form.updateValueAndValidity();

    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerIrule: {
        name: 'iRule1',
        content: 'Content',
        description: 'Description',
        tierId: '1',
      },
    });
  });

  it('should update an existing iRule', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerIrulesIdPut');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: IRuleModalDto = {
        tierId: '1',
        iRule: {
          id: '2',
          name: 'iRule2',
          content: 'Content',
          description: 'Description',
          tierId: '1',
        },
      };
      return dto;
    });

    component.getData();

    component.form.setValue({
      name: 'iRule100',
      content: 'New Content',
      description: 'New Description',
    });
    component.form.updateValueAndValidity();

    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerIrule: {
        tierId: null,
        name: 'iRule100',
        content: 'New Content',
        description: 'New Description',
      },
    });
  });
});
