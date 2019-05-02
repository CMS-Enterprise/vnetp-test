import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkObjectGroupModalComponent } from './network-object-group-modal.component';

describe('NetworkObjectGroupModalComponent', () => {
  let component: NetworkObjectGroupModalComponent;
  let fixture: ComponentFixture<NetworkObjectGroupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkObjectGroupModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
