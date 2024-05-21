import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormSubnetsModalComponent } from './wan-form-subnets-modal.component';

describe('WanFormSubnetsModalComponent', () => {
  let component: WanFormSubnetsModalComponent;
  let fixture: ComponentFixture<WanFormSubnetsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WanFormSubnetsModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormSubnetsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
