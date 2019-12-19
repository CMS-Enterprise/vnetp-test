import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VmwareDetailComponent } from './vmware-detail.component';

describe('VmwareDetailComponent', () => {
  let component: VmwareDetailComponent;
  let fixture: ComponentFixture<VmwareDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VmwareDetailComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VmwareDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
