import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MockFontAwesomeComponent, MockComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { NatRuleGroupListComponent } from './nat-rule-group-list.component';
import { CookieService } from 'ngx-cookie-service';

describe('NatRuleGroupListComponent', () => {
  let component: NatRuleGroupListComponent;
  let fixture: ComponentFixture<NatRuleGroupListComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule, HttpClientTestingModule, RouterTestingModule.withRoutes([])],
      declarations: [NatRuleGroupListComponent, MockComponent({ selector: 'app-nat-rule-group-modal' }), MockFontAwesomeComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }, FormBuilder, CookieService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(NatRuleGroupListComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
