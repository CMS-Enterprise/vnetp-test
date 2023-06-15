import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'src/test/mock-components';

import { NetcentricComponent } from './netcentric.component';

describe('NetcentricComponent', () => {
  let component: NetcentricComponent;
  let fixture: ComponentFixture<NetcentricComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NetcentricComponent, MockComponent('app-navbar'), MockComponent('app-breadcrumb')],
      imports: [RouterTestingModule],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetcentricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
