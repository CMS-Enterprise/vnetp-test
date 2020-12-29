import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { RouteModalComponent } from './route-modal.component';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerRoute, V1LoadBalancerRoutesService } from 'api_client';
import TestUtil from 'src/test/TestUtil';
import { RouteModalDto } from './route-modal.dto';

describe('RouteModalComponent', () => {
  let component: RouteModalComponent;
  let fixture: ComponentFixture<RouteModalComponent>;
  let service: V1LoadBalancerRoutesService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [RouteModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1LoadBalancerRoutesService)],
    });

    fixture = TestBed.createComponent(RouteModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerRoutesService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createRoute = (): LoadBalancerRoute => {
    return {
      tierId: '1',
      id: '2',
      name: 'Route2',
      destination: '192.168.1.1/11',
      gateway: '192.168.1.1',
    };
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.f.name)).toBe(true);
  });

  it('name, destination and gateway should be required', () => {
    const fields = ['name', 'destination', 'gateway'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('should disable name, destination and gateway when editing an existing route', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: RouteModalDto = {
        tierId: '1',
        route: createRoute(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.destination.disabled).toBe(true);
    expect(component.form.controls.gateway.disabled).toBe(true);
  });

  it('should create a new route', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerRoutesPost');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: RouteModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();

    component.form.setValue({
      destination: '192.168.1.2/12',
      gateway: '192.168.1.2',
      name: 'NewName',
    });

    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerRoute: {
        destination: '192.168.1.2/12',
        gateway: '192.168.1.2',
        name: 'NewName',
        tierId: '1',
      },
    });
  });

  it('should update an existing route', () => {
    const spy = jest.spyOn(service, 'v1LoadBalancerRoutesIdPut');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: RouteModalDto = {
        tierId: '1',
        route: createRoute(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      destination: '192.168.1.2/12',
      gateway: '192.168.1.2',
      name: 'NewName',
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerRoute: {
        destination: '192.168.1.2/12',
        gateway: '192.168.1.2',
        name: 'NewName',
        tierId: null,
      },
    });
  });
});
