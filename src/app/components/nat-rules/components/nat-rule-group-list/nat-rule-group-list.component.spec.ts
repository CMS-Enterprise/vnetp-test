import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MockFontAwesomeComponent, MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalServiceStub } from 'src/test/modal-mock';
import { NatRuleGroupListComponent } from './nat-rule-group-list.component';
import { Subject } from 'rxjs';
import { Tier } from 'api_client';
import { TierContextService } from 'src/app/services/tier-context.service';

describe('NatRuleGroupListComponent', () => {
  let component: NatRuleGroupListComponent;
  let fixture: ComponentFixture<NatRuleGroupListComponent>;

  const tierSubject = new Subject<Tier>();

  beforeEach(async(() => {
    const tierContextService = {
      currentTier: tierSubject.asObservable(),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgxPaginationModule],
      declarations: [
        NatRuleGroupListComponent,
        MockComponent({ selector: 'app-nat-rule-group-modal' }),
        MockComponent({ selector: 'app-yes-no-modal' }),
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: new NgxSmartModalServiceStub() },
        FormBuilder,
        { provide: TierContextService, useValue: tierContextService },
      ],
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
