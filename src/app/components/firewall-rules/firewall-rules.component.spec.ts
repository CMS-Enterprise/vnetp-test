import { CookieService } from 'ngx-cookie-service';
import { FilterPipe } from 'src/app/pipes/filter.pipe';
import { FirewallRuleModalComponent } from './firewall-rule-modal/firewall-rule-modal.component';
import { FirewallRulesComponent } from './firewall-rules.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import {
  MockFontAwesomeComponent,
  MockTooltipComponent,
  MockTabsComponent,
  MockYesNoModalComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

describe('FirewallRulesComponent', () => {
  let component: FirewallRulesComponent;
  let fixture: ComponentFixture<FirewallRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientTestingModule, NgxPaginationModule],
      declarations: [
        FilterPipe,
        FirewallRuleModalComponent,
        FirewallRulesComponent,
        ImportExportComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockTooltipComponent,
        MockYesNoModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), CookieService, FormBuilder],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FirewallRulesComponent);
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
