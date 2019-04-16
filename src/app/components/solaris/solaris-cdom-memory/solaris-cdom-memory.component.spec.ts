import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomMemoryComponent } from './solaris-cdom-memory.component';

describe('SolarisCdomMemoryComponent', () => {
  let component: SolarisCdomMemoryComponent;
  let fixture: ComponentFixture<SolarisCdomMemoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisCdomMemoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomMemoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
