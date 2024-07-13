import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiteTableComponent } from './lite-table.component';

describe('LiteTableComponent', () => {
  let component: LiteTableComponent;
  let fixture: ComponentFixture<LiteTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LiteTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LiteTableComponent);
    component = fixture.componentInstance;
    component.config = {
      columns: [],
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
