import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'src/test/mock-components';

import { AppcentricComponent } from './appcentric.component';

describe('AppcentricComponent', () => {
  let component: AppcentricComponent;
  let fixture: ComponentFixture<AppcentricComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AppcentricComponent, MockComponent('app-appcentric-navbar'), MockComponent('app-breadcrumb')],
      imports: [],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppcentricComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
