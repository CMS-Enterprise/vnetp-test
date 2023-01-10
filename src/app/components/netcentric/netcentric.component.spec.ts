import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetcentricComponent } from './netcentric.component';

describe('NetcentricComponent', () => {
  let component: NetcentricComponent;
  let fixture: ComponentFixture<NetcentricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetcentricComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetcentricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const k = true;
  it('should create', () => {
    expect(k).toBeTruthy();
  });
});
