import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { V1PriorityGroupsService, PriorityGroup, V1VmwareVirtualMachinesService } from 'api_client';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { PriorityGroupModalComponent, SelectableVM } from './priority-group-modal.component';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MockProvider } from 'src/test/mock-providers';

describe('PriorityGroupModalComponent', () => {
  let component: PriorityGroupModalComponent;
  let fixture: ComponentFixture<PriorityGroupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [PriorityGroupModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1PriorityGroupsService), MockProvider(V1VmwareVirtualMachinesService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(PriorityGroupModalComponent);
        component = fixture.componentInstance;
        component.datacenterId = 'datacenterId';
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update an existing priority group', () => {
    jest.spyOn(TestBed.inject(NgxSmartModalService), 'getModalData').mockImplementation(() => {
      return {
        modalMode: ModalMode.Edit,
        datacenterId: '1',
        priorityGroup: { id: '2' } as PriorityGroup,
      };
    });
    component.loadPriorityGroup();
    component.form.setValue({
      name: 'PG2',
      priority: 2,
    });
    fixture.detectChanges();

    const updateSpy = jest.spyOn(TestBed.inject(V1PriorityGroupsService), 'v1PriorityGroupsIdPut');
    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(updateSpy).toHaveBeenCalledWith({
      id: '2',
      priorityGroup: {
        datacenterId: null,
        name: 'PG2',
        priority: 2,
      },
    });
  });

  it('should create a new priority group with virtual machines', () => {
    jest.spyOn(TestBed.inject(NgxSmartModalService), 'getModalData').mockImplementation(() => {
      return {
        modalMode: ModalMode.Create,
        datacenterId: '1',
      };
    });
    component.loadPriorityGroup();

    component.virtualMachines = [{ id: '2', isSelected: true }] as SelectableVM[];
    component.form.setValue({
      name: 'PG1',
      priority: 1,
    });
    fixture.detectChanges();

    const createSpy = jest.spyOn(TestBed.inject(V1PriorityGroupsService), 'v1PriorityGroupsPost');
    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createSpy).toHaveBeenCalledWith({
      createPriorityGroupDto: {
        datacenterId: '1',
        name: 'PG1',
        priority: 1,
        vmwareVirtualMachineIds: ['2'],
      },
    });
  });
});
