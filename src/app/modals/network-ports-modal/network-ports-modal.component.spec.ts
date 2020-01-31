import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkPortsModalComponent } from './network-ports-modal.component';

describe('NetworkPortsModalComponent', () => {
  let component: NetworkPortsModalComponent;
  let fixture: ComponentFixture<NetworkPortsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkPortsModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkPortsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
