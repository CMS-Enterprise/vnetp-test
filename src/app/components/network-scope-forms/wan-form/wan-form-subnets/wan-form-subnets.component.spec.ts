import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormSubnetsComponent } from './wan-form-subnets.component';

describe('WanFormSubnetsComponent', () => {
  let component: WanFormSubnetsComponent;
  let fixture: ComponentFixture<WanFormSubnetsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WanFormSubnetsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WanFormSubnetsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
