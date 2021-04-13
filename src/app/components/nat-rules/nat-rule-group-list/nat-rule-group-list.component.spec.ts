import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MockFontAwesomeComponent, MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { NatRuleGroupListComponent } from './nat-rule-group-list.component';
import { TierContextService } from 'src/app/services/tier-context.service';
import { MockProvider } from '../../../../test/mock-providers';

describe('NatRuleGroupListComponent', () => {
  let component: NatRuleGroupListComponent;
  let fixture: ComponentFixture<NatRuleGroupListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule],
      declarations: [
        NatRuleGroupListComponent,
        MockComponent({ selector: 'app-nat-rule-group-modal' }),
        MockComponent({ selector: 'app-yes-no-modal' }),
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(TierContextService)],
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
