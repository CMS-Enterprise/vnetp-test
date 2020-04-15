import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatacenterSelectComponent } from './datacenter-select.component';

describe('DatacenterSelectComponent', () => {
  let component: DatacenterSelectComponent;
  let fixture: ComponentFixture<DatacenterSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DatacenterSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatacenterSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
