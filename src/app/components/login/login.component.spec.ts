import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DashboardComponent } from '../dashboard/dashboard.component';
import { D3PieChartComponent } from '../d3-pie-chart/d3-pie-chart.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        RouterTestingModule.withRoutes([{ path: 'dashboard', component: DashboardComponent }]),
        ToastrModule.forRoot(),
        HttpClientTestingModule,
      ],
      declarations: [LoginComponent, DashboardComponent, D3PieChartComponent, TooltipComponent, MockFontAwesomeComponent],
      providers: [CookieService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
