import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkObjectModalComponent } from './network-object-modal.component';

describe('NetworkObjectModalComponent', () => {
  let component: NetworkObjectModalComponent;
  let fixture: ComponentFixture<NetworkObjectModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkObjectModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
