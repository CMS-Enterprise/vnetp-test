import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CdomDetailComponent } from './cdom-detail.component';

describe('CdomDetailComponent', () => {
  let component: CdomDetailComponent;
  let fixture: ComponentFixture<CdomDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CdomDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CdomDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
