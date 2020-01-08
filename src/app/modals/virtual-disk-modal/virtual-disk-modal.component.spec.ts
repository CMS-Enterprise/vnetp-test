import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualDiskModalComponent } from './virtual-disk-modal.component';

describe('VirtualDiskModalComponent', () => {
  let component: VirtualDiskModalComponent;
  let fixture: ComponentFixture<VirtualDiskModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualDiskModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(VirtualDiskModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
