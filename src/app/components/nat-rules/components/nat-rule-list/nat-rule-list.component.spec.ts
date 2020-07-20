import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MockFontAwesomeComponent, MockComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { NatRuleListComponent } from './nat-rule-list.component';
import { CookieService } from 'ngx-cookie-service';

describe('NatRuleGroupListComponent', () => {
  let component: NatRuleListComponent;
  let fixture: ComponentFixture<NatRuleListComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [NatRuleListComponent, MockComponent({ selector: 'app-nat-rule-modal' }), MockFontAwesomeComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, CookieService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NatRuleListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
