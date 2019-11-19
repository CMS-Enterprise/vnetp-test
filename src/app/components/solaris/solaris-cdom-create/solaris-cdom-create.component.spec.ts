import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolarisCdomCreateComponent } from './solaris-cdom-create.component';

describe('SolarisCdomCreateComponent', () => {
  let component: SolarisCdomCreateComponent;
  let fixture: ComponentFixture<SolarisCdomCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SolarisCdomCreateComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolarisCdomCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  // });
});
