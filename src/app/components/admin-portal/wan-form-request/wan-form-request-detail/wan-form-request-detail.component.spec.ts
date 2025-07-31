import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormRequestDetailComponent } from './wan-form-request-detail.component';

describe('WanFormRequestDetailComponent', () => {
  let component: WanFormRequestDetailComponent;
  let fixture: ComponentFixture<WanFormRequestDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WanFormRequestDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormRequestDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
