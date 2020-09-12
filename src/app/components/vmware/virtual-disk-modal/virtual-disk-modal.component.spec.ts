import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualDiskModalComponent } from './virtual-disk-modal.component';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockProvider } from 'src/test/mock-providers';
import { V1VmwareVirtualDisksService } from 'api_client';
import TestUtil from 'src/test/TestUtil';
import { By } from '@angular/platform-browser';
import { VirtualMachineModalDto } from 'src/app/models/vmware/virtual-machine-modal-dto';
import { ModalMode } from 'src/app/models/other/modal-mode';

describe('VirtualDiskModalComponent', () => {
  let component: VirtualDiskModalComponent;
  let fixture: ComponentFixture<VirtualDiskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [VirtualDiskModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1VmwareVirtualDisksService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(VirtualDiskModalComponent);
        component = fixture.componentInstance;
        component.VirtualMachineId = '1';
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

  describe('Description', () => {
    it('should be optional', () => {
      const { description } = component.form.controls;

      description.setValue(null);
      expect(description.valid).toBe(true);
    });

    it('should have a minimum length of 3 and maximum length of 500', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(false);

      description.setValue('a'.repeat(3));
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(501));
      expect(description.valid).toBe(false);
    });
  });

  it('should require name', () => {
    const requiredFields = ['name'];

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

  describe('save', () => {
    const clickSaveButton = () => fixture.debugElement.query(By.css('.btn.btn-success')).nativeElement.click();

    it('should not create a vmware virtual disk when the form is invalid', () => {
      const service = TestBed.get(V1VmwareVirtualDisksService);
      const createVirtualDiskSpy = jest.spyOn(service, 'v1VmwareVirtualDisksPost');

      component.form.setValue({
        name: null,
        description: 'Description',
        diskSize: null,
        rawLun: null,
      });

      clickSaveButton();

      expect(createVirtualDiskSpy).not.toHaveBeenCalled();
    });

    it('should create a vmware virtual disk', () => {
      const service = TestBed.get(V1VmwareVirtualDisksService);
      const createVirtualDiskSpy = jest.spyOn(service, 'v1VmwareVirtualDisksPost');

      component.form.setValue({
        name: 'Test',
        description: 'Description',
        diskSize: 1,
        rawLun: true,
      });

      clickSaveButton();

      expect(createVirtualDiskSpy).toHaveBeenCalledWith({
        vmwareVirtualDisk: {
          virtualMachineId: '1',
          name: 'Test',
          description: 'Description',
          diskSize: 1000000000,
          rawLun: true,
        },
      });
    });
  });

  describe('getData', () => {
    const createDto = (): VirtualMachineModalDto => {
      return {
        DatacenterId: '1',
        VirtualMachineId: '2',
        ModalMode: ModalMode.Create,
        VmwareVirtualMachine: {
          id: '24',
          datacenterId: '1',
          name: 'Virtual Machine',
          cpuCores: 2,
          cpuCoresPerSocket: 2,
          highPerformance: false,
          cpuReserved: true,
          memoryReserved: true,
          memorySize: 2,
          priorityGroupId: '',
        },
      };
    };

    it('should initialize the virtual machine', () => {
      const service = TestBed.get(NgxSmartModalService);
      const dto = createDto();
      dto.VirtualMachineId = '123';
      jest.spyOn(service, 'getModalData').mockImplementation(() => dto);

      component.getData();

      expect(component.VirtualMachineId).toBe('123');
    });
  });
});
