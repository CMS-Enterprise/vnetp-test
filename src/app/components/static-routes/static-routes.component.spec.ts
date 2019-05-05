import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { StaticRoutesComponent } from './static-routes.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { RouterTestingModule } from '@angular/router/testing';

describe('StaticRoutesComponent', () => {
  let component: StaticRoutesComponent;
  let fixture: ComponentFixture<StaticRoutesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports : [RouterTestingModule, AngularFontAwesomeModule],
      declarations: [ StaticRoutesComponent ],
      providers: [HttpClient, HttpHandler, CookieService]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StaticRoutesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
