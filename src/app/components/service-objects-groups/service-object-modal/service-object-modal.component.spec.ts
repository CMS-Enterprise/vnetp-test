import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ServiceObjectModalComponent } from '../service-object-modal/service-object-modal.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { V1NetworkSecurityServiceObjectsService, ServiceObjectProtocol } from 'api_client';
import TestUtil from 'src/test/TestUtil';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { ServiceObjectModalDto } from 'src/app/models/service-objects/service-object-modal-dto';

describe('ServiceObjectModalComponent', () => {
  let component: ServiceObjectModalComponent;
  let fixture: ComponentFixture<ServiceObjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ServiceObjectModalComponent, MockTooltipComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkSecurityServiceObjectsService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ServiceObjectModalComponent);
        component = fixture.componentInstance;
        component.TierId = '1';
        component.ServiceObjectId = '2';
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Name', () => {
    it('should have a minimum length of 3 and maximum length of 100', () => {
      const { name } = component.form.controls;

      name.setValue('a');
      expect(name.valid).toBe(false);

      name.setValue('a'.repeat(3));
      expect(name.valid).toBe(true);

      name.setValue('a'.repeat(101));
      expect(name.valid).toBe(false);
    });

    it('should not allow invalid characters', () => {
      const { name } = component.form.controls;

      name.setValue('invalid/name!');
      expect(name.valid).toBe(false);
    });
  });

  it('should require name, protocol, destination ports and source ports', () => {
    const requiredFields = ['name', 'protocol', 'destinationPorts', 'sourcePorts'];

    requiredFields.forEach(f => {
      expect(TestUtil.isFormControlRequired(component.form.controls[f])).toBe(true);
    });
  });

  it('should return form controls', () => {
    expect(component.f.name).toBeTruthy();
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.name.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.name.value).toBe('');
  });

  it('should not create a service object when the form is invalid', () => {
    const service = TestBed.get(V1NetworkSecurityServiceObjectsService);
    const createServiceObjectSpy = jest.spyOn(service, 'v1NetworkSecurityServiceObjectsPost');

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: null,
      protocol: null,
      destinationPorts: null,
      sourcePorts: null,
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createServiceObjectSpy).not.toHaveBeenCalled();
  });

  it('should call to create a service object when in create mode', () => {
    const service = TestBed.get(V1NetworkSecurityServiceObjectsService);
    const createServiceObjectSpy = jest.spyOn(service, 'v1NetworkSecurityServiceObjectsPost');

    component.ModalMode = ModalMode.Create;
    component.form.setValue({
      name: 'Test',
      protocol: ServiceObjectProtocol.IP,
      destinationPorts: 'any',
      sourcePorts: 'any',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createServiceObjectSpy).toHaveBeenCalledWith({
      serviceObject: {
        tierId: '1',
        name: 'Test',
        protocol: ServiceObjectProtocol.IP,
        destinationPorts: 'any',
        sourcePorts: 'any',
      },
    });
  });

  it('should call to edit an existing service object when in edit mode', () => {
    const service = TestBed.get(V1NetworkSecurityServiceObjectsService);
    const updateServiceObjectSpy = jest.spyOn(service, 'v1NetworkSecurityServiceObjectsIdPut');

    component.ModalMode = ModalMode.Edit;
    component.form.setValue({
      name: 'Test',
      protocol: ServiceObjectProtocol.IP,
      destinationPorts: 'any',
      sourcePorts: 'any',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateServiceObjectSpy).toHaveBeenCalledWith({
      id: '2',
      serviceObject: {
        name: null,
        protocol: null,
        destinationPorts: 'any',
        sourcePorts: 'any',
      },
    });
  });

  describe('getData', () => {
    const createServiceObjectModalDto = (): ServiceObjectModalDto => {
      return {
        TierId: '1',
        ServiceObject: {
          tierId: '1',
          id: '2',
          name: 'ServiceObject',
          protocol: ServiceObjectProtocol.IP,
          destinationPorts: 'any',
          sourcePorts: 'any',
        },
        ModalMode: ModalMode.Edit,
      };
    };

    it('should throw an error if the modal mode is not set', () => {
      const ngx = TestBed.get(NgxSmartModalService);
      const dto = createServiceObjectModalDto();
      dto.ModalMode = null;
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => dto);
      const throwsError = () => component.getData();

      expect(throwsError).toThrowError('Modal Mode not Set.');
    });

    it('should enable the name, protocol, source ports and destination ports when creating a new service object', () => {
      const ngx = TestBed.get(NgxSmartModalService);
      const dto = createServiceObjectModalDto();
      dto.ServiceObject = undefined;
      dto.ModalMode = ModalMode.Create;
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => dto);

      component.getData();

      expect(component.form.controls.name.enabled).toBe(true);
      expect(component.form.controls.protocol.enabled).toBe(true);
      expect(component.form.controls.sourcePorts.enabled).toBe(true);
      expect(component.form.controls.destinationPorts.enabled).toBe(true);
    });

    it('should disable the name and protocol when editing an existing service object', () => {
      const ngx = TestBed.get(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createServiceObjectModalDto());

      component.getData();

      expect(component.form.controls.name.disabled).toBe(true);
      expect(component.form.controls.protocol.disabled).toBe(true);
    });
  });
});
