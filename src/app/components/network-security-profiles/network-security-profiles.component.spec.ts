import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkSecurityProfilesComponent } from './network-security-profiles.component';

describe('NetworkSecurityProfilesComponent', () => {
  let component: NetworkSecurityProfilesComponent;
  let fixture: ComponentFixture<NetworkSecurityProfilesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkSecurityProfilesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkSecurityProfilesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
