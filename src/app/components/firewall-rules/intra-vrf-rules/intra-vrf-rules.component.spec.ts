import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IntraVrfRulesComponent } from './intra-vrf-rules.component';
import { MockFontAwesomeComponent, MockTooltipComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { MockProvider } from 'src/test/mock-providers';
import { ContractModalComponent } from '../contract-modal/contract-modal.component';

describe('IntraVrfRulesComponent', () => {
  let component: IntraVrfRulesComponent;
  let fixture: ComponentFixture<IntraVrfRulesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxSmartModalModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [
        IntraVrfRulesComponent,
        ContractModalComponent,
        MockTooltipComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
              url: [{ path: 'firewall-rules' }, { path: 'intravrf' }],
            },
          },
        },
        CookieService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntraVrfRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
