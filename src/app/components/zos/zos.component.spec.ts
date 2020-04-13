import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZosComponent } from './zos.component';

describe('ZosComponent', () => {
  let component: ZosComponent;
  let fixture: ComponentFixture<ZosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ZosComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
