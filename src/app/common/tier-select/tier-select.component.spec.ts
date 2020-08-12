import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TierSelectComponent } from './tier-select.component';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { NgSelectModule } from '@ng-select/ng-select';
import { MockProvider } from 'src/test/mock-providers';
import { ToastrService } from 'ngx-toastr';

describe('TierSelectComponent', () => {
  let component: TierSelectComponent;
  let fixture: ComponentFixture<TierSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, HttpClientTestingModule, RouterTestingModule.withRoutes([]), NgSelectModule],
      declarations: [TierSelectComponent],
      providers: [CookieService, MockProvider(NgxSmartModalService), MockProvider(ToastrService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TierSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
