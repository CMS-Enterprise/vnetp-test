import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PartitionDetailsComponent } from './partition-details.component';

describe('PartitionDetailsComponent', () => {
  let component: PartitionDetailsComponent;
  let fixture: ComponentFixture<PartitionDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PartitionDetailsComponent],
    });
    fixture = TestBed.createComponent(PartitionDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
