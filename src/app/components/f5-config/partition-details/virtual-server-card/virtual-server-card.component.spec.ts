import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualServerCardComponent } from './virtual-server-card.component';

describe('VirtualServerCardComponent', () => {
  let component: VirtualServerCardComponent;
  let fixture: ComponentFixture<VirtualServerCardComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VirtualServerCardComponent],
    });
    fixture = TestBed.createComponent(VirtualServerCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
