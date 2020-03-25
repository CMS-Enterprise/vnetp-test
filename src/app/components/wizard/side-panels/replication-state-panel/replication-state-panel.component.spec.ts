import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReplicationStatePanelComponent } from './replication-state-panel.component';

describe('ReplicationStatePanelComponent', () => {
  let component: ReplicationStatePanelComponent;
  let fixture: ComponentFixture<ReplicationStatePanelComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ReplicationStatePanelComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReplicationStatePanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
