import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IpNatsComponent } from './ip-nats.component';

describe('IpNatsComponent', () => {
  let component: IpNatsComponent;
  let fixture: ComponentFixture<IpNatsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ IpNatsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IpNatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
