import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockComponent,
  MockNgxSmartModalComponent,
  MockTabsComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { NatRuleListComponent } from './nat-rule-list.component';
import { CookieService } from 'ngx-cookie-service';
import { MockProvider } from '../../../../test/mock-providers';
import { TierContextService } from '../../../services/tier-context.service';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { DatacenterContextService } from '../../../services/datacenter-context.service';
import { V1TiersService } from '../../../../../api_client';

describe('NatRuleListComponent', () => {
  let component: NatRuleListComponent;
  let fixture: ComponentFixture<NatRuleListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NgxPaginationModule],
      declarations: [
        FilterPipe,
        NatRuleListComponent,
        MockComponent({ selector: 'app-nat-rule-modal' }),
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockTabsComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(TierContextService),
        MockProvider(DatacenterContextService),
        MockProvider(V1TiersService),
      ],
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
