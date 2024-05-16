import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormDetailComponent } from './wan-form-detail.component';

describe('WanFormDetailComponent', () => {
  let component: WanFormDetailComponent;
  let fixture: ComponentFixture<WanFormDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WanFormDetailComponent],
    });
    fixture = TestBed.createComponent(WanFormDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
