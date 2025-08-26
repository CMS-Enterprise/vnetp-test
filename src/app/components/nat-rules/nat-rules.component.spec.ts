import { ComponentFixture, TestBed } from '@angular/core/testing';
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
import { V1TiersService } from 'client';
import { MockProvider } from '../../../test/mock-providers';
import { FilterPipe } from '../../pipes/filter.pipe';
import { DatacenterContextService } from '../../services/datacenter-context.service';
import { TierContextService } from '../../services/tier-context.service';
import { NatRulesComponent } from './nat-rules.component';

describe('NatRuleComponent', () => {
  let component: NatRulesComponent;
  let fixture: ComponentFixture<NatRulesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, NgxPaginationModule],
      declarations: [
        FilterPipe,
        NatRulesComponent,
        MockComponent('app-nat-rule-modal'),
        MockComponent('app-tier-select'),
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
        fixture = TestBed.createComponent(NatRulesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
