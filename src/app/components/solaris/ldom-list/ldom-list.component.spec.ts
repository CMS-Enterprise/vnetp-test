import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LdomListComponent } from './ldom-list.component';

describe('LdomListComponent', () => {
  let component: LdomListComponent;
  let fixture: ComponentFixture<LdomListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LdomListComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LdomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
