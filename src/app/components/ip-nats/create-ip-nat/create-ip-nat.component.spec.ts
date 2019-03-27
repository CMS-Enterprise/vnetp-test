import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateIpNatComponent } from './create-ip-nat.component';

describe('CreateIpNatComponent', () => {
  let component: CreateIpNatComponent;
  let fixture: ComponentFixture<CreateIpNatComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateIpNatComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateIpNatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
