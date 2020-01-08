import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualMachineModalComponent } from './virtual-machine-modal.component';

describe('VirtualMachineModalComponent', () => {
  let component: VirtualMachineModalComponent;
  let fixture: ComponentFixture<VirtualMachineModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualMachineModalComponent],
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
});
