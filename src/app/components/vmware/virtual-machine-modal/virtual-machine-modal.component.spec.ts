import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualMachineModalComponent } from './virtual-machine-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockProvider } from 'src/test/mock-providers';
import {
  V1VmwareNetworkAdapterService,
  V1PriorityGroupsService,
  V1VmwareVirtualDisksService,
  V1VmwareVirtualMachinesService,
} from 'client';

describe('VirtualMachineModalComponent', () => {
  let component: VirtualMachineModalComponent;
  let fixture: ComponentFixture<VirtualMachineModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [VirtualMachineModalComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1VmwareNetworkAdapterService),
        MockProvider(V1PriorityGroupsService),
        MockProvider(V1VmwareVirtualDisksService),
        MockProvider(V1VmwareVirtualMachinesService),
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualMachineModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

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
});
