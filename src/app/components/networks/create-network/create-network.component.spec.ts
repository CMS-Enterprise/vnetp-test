import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CookieService } from 'ngx-cookie-service';
import { CreateNetworkComponent } from './create-network.component';
import { FormsModule } from '@angular/forms';
import { NgxMaskModule } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CreateNetworkComponent', () => {
  let component: CreateNetworkComponent;
  let fixture: ComponentFixture<CreateNetworkComponent>;
  let router: Router;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        FormsModule,
        NgxMaskModule,
        RouterTestingModule.withRoutes([]),
        ToastrModule.forRoot(),
        NgxMaskModule.forRoot(),
        HttpClientTestingModule
      ],
      declarations: [CreateNetworkComponent, TooltipComponent],
      providers: [CookieService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateNetworkComponent);
    component = fixture.componentInstance;
    router = TestBed.get(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
