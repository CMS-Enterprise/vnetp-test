import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLoadBalancerComponent } from './edit-load-balancer.component';

describe('EditLoadBalancerComponent', () => {
  let component: EditLoadBalancerComponent;
  let fixture: ComponentFixture<EditLoadBalancerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLoadBalancerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLoadBalancerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
