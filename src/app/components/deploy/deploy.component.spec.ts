import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { DeployComponent } from './deploy.component';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DeployComponent', () => {
  let component: DeployComponent;
  let fixture: ComponentFixture<DeployComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      declarations: [DeployComponent],
      providers: [HttpClientTestingModule, CookieService],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeployComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
