import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSecurityProfileDetailComponent } from './network-security-profile-detail.component';

describe('NetworkSecurityProfileDetailComponent', () => {
  let component: NetworkSecurityProfileDetailComponent;
  let fixture: ComponentFixture<NetworkSecurityProfileDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkSecurityProfileDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSecurityProfileDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
