import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZosZvmRequestModalComponent } from './zos-zvm-request-modal.component';

describe('ZosZvmRequestModalComponent', () => {
  let component: ZosZvmRequestModalComponent;
  let fixture: ComponentFixture<ZosZvmRequestModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ZosZvmRequestModalComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZosZvmRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
