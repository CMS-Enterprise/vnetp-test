import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomListComponent } from './solaris-cdom-list.component';

describe('SolarisCdomListComponent', () => {
  let component: SolarisCdomListComponent;
  let fixture: ComponentFixture<SolarisCdomListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolarisCdomListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
