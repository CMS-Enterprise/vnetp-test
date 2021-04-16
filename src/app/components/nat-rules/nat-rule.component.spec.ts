import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  MockFontAwesomeComponent,
  MockComponent,
  MockNgxSmartModalComponent,
  MockTabsComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxPaginationModule } from 'ngx-pagination';
import { V1TiersService } from '../../../../api_client';
import { MockProvider } from '../../../test/mock-providers';
import { FilterPipe } from '../../pipes/filter.pipe';
import { DatacenterContextService } from '../../services/datacenter-context.service';
import { TierContextService } from '../../services/tier-context.service';
import { NatRuleComponent } from './nat-rule.component';

describe('NatRuleComponent', () => {
  let component: NatRuleComponent;
  let fixture: ComponentFixture<NatRuleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NgxPaginationModule],
      declarations: [
        FilterPipe,
        NatRuleComponent,
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
        fixture = TestBed.createComponent(NatRuleComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
