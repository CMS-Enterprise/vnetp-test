import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualMachineDetailComponent } from './virtual-machine-detail.component';

describe('VirtualMachineDetailComponent', () => {
  let component: VirtualMachineDetailComponent;
  let fixture: ComponentFixture<VirtualMachineDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ VirtualMachineDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualMachineDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
