import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkObjectsGroupsComponent } from './network-objects-groups.component';

describe('NetworkObjectsGroupsComponent', () => {
  let component: NetworkObjectsGroupsComponent;
  let fixture: ComponentFixture<NetworkObjectsGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NetworkObjectsGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkObjectsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
