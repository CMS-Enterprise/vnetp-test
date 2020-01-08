import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkAdapterModalComponent } from './network-adapter-modal.component';

describe('NetworkAdapterModalComponent', () => {
  let component: NetworkAdapterModalComponent;
  let fixture: ComponentFixture<NetworkAdapterModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetworkAdapterModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkAdapterModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
