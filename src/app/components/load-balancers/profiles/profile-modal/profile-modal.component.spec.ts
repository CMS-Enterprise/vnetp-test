import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { ProfileModalComponent, ProfileReverseProxyType } from './profile-modal.component';
import { ToastrService } from 'ngx-toastr';
import { MockProvider } from 'src/test/mock-providers';
import { LoadBalancerProfile, LoadBalancerProfileTypeEnum, V1LoadBalancerProfilesService } from 'client';
import TestUtil from 'src/test/TestUtil';
import { ProfileModalDto } from './profile-modal.dto';

describe('ProfileModalComponent', () => {
  let component: ProfileModalComponent;
  let fixture: ComponentFixture<ProfileModalComponent>;
  let service: V1LoadBalancerProfilesService;
  let ngx: NgxSmartModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ProfileModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(ToastrService), MockProvider(V1LoadBalancerProfilesService)],
    });

    fixture = TestBed.createComponent(ProfileModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    service = TestBed.inject(V1LoadBalancerProfilesService);
    ngx = TestBed.inject(NgxSmartModalService);
  });

  const createProfile = (): LoadBalancerProfile => ({
    tierId: '1',
    id: '2',
    name: 'Profile2',
    type: LoadBalancerProfileTypeEnum.ClientSsl,
    certificate: 'a'.repeat(60),
    reverseProxy: null,
    properties: [],
    key: 'key',
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('name should have NameValidator', () => {
    expect(TestUtil.hasNameValidator(component.f.name)).toBe(true);
  });

  it('name and type should be required', () => {
    const fields = ['name', 'type'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('certificate should be required when type is "ClientSSL"', () => {
    const { type } = component.f;
    type.setValue(LoadBalancerProfileTypeEnum.ClientSsl);
    fixture.detectChanges();

    const fields = ['certificate'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('reverseProxy should be required when type is "Http"', () => {
    const { type } = component.f;
    type.setValue(LoadBalancerProfileTypeEnum.Http);
    fixture.detectChanges();

    const fields = ['reverseProxy'];
    expect(TestUtil.areRequiredFields(component.form, fields)).toBe(true);
  });

  it('should disable name and type when editing an existing profile', () => {
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: ProfileModalDto = {
        tierId: '1',
        profile: createProfile(),
      };
      return dto;
    });

    component.getData();

    expect(component.form.controls.name.disabled).toBe(true);
    expect(component.form.controls.type.disabled).toBe(true);
    expect(component.form.controls.certificate.disabled).toBe(false);
    expect(component.form.controls.description.disabled).toBe(false);
    expect(component.form.controls.reverseProxy.disabled).toBe(false);
  });

  it('should create a new profile', () => {
    const spy = jest.spyOn(service, 'createOneLoadBalancerProfile');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: ProfileModalDto = {
        tierId: '1',
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      certificate: null,
      description: 'Description',
      name: 'NewName',
      reverseProxy: ProfileReverseProxyType.Explicit,
      type: LoadBalancerProfileTypeEnum.Http,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      loadBalancerProfile: {
        certificate: null,
        description: 'Description',
        key: null,
        name: 'NewName',
        properties: null,
        reverseProxy: ProfileReverseProxyType.Explicit,
        tierId: '1',
        type: LoadBalancerProfileTypeEnum.Http,
      },
    });
  });

  it('should update an existing profile', () => {
    const spy = jest.spyOn(service, 'updateOneLoadBalancerProfile');
    jest.spyOn(ngx, 'getModalData').mockImplementation(() => {
      const dto: ProfileModalDto = {
        tierId: '1',
        profile: createProfile(),
      };
      return dto;
    });

    component.getData();
    component.form.setValue({
      certificate: null,
      description: 'Description',
      name: 'NewName',
      reverseProxy: ProfileReverseProxyType.Explicit,
      type: LoadBalancerProfileTypeEnum.Http,
    });
    component.save();

    expect(spy).toHaveBeenCalledWith({
      id: '2',
      loadBalancerProfile: {
        certificate: null,
        description: 'Description',
        key: null,
        name: undefined,
        properties: null,
        reverseProxy: ProfileReverseProxyType.Explicit,
        type: undefined,
      },
    });
  });
});
