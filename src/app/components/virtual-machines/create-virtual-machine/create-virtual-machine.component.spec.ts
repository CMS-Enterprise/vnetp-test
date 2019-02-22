import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateVirtualMachineComponent } from './create-virtual-machine.component';

describe('CreateVirtualMachineComponent', () => {
  let component: CreateVirtualMachineComponent;
  let fixture: ComponentFixture<CreateVirtualMachineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateVirtualMachineComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateVirtualMachineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
