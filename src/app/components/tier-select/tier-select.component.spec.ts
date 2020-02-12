import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TierSelectComponent } from './tier-select.component';

describe('TierSelectComponent', () => {
  let component: TierSelectComponent;
  let fixture: ComponentFixture<TierSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TierSelectComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TierSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
