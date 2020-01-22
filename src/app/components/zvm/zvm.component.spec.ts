import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZvmComponent } from './zvm.component';

describe('ZvmComponent', () => {
  let component: ZvmComponent;
  let fixture: ComponentFixture<ZvmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ZvmComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZvmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
