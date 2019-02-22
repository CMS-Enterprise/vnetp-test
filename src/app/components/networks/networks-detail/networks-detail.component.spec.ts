import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworksDetailComponent } from './networks-detail.component';

describe('NetworksDetailComponent', () => {
  let component: NetworksDetailComponent;
  let fixture: ComponentFixture<NetworksDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworksDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworksDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
