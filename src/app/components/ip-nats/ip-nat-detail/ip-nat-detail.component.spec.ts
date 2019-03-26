import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpNatDetailComponent } from './ip-nat-detail.component';

describe('IpNatDetailComponent', () => {
  let component: IpNatDetailComponent;
  let fixture: ComponentFixture<IpNatDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IpNatDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpNatDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
