import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient, HttpHandler } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { NetworksDetailComponent } from './networks-detail.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';

describe('NetworksDetailComponent', () => {
  let component: NetworksDetailComponent;
  let fixture: ComponentFixture<NetworksDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule, FormsModule, NgxSmartModalModule],
      declarations: [ NetworksDetailComponent ],
      providers: [HttpClient, HttpHandler, CookieService]

    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworksDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
