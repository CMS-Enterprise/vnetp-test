import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormRequestComponent } from './wan-form-request.component';

describe('WanFormRequestComponent', () => {
  let component: WanFormRequestComponent;
  let fixture: ComponentFixture<WanFormRequestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WanFormRequestComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
