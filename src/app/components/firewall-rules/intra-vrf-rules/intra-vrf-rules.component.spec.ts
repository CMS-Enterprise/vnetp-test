import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntraVrfRulesComponent } from './intra-vrf-rules.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ContractModalComponent } from 'src/app/modals/contract-modal/contract-modal.component';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';

describe('IntraVrfRulesComponent', () => {
  let component: IntraVrfRulesComponent;
  let fixture: ComponentFixture<IntraVrfRulesComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        AngularFontAwesomeModule,
        NgxSmartModalModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule
      ],
      declarations: [
        IntraVrfRulesComponent,
        ContractModalComponent,
        TooltipComponent
      ],
      providers: [
        { provide: NgxSmartModalService, useValue: ngx },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' }),
              url: [{ path: 'firewall-rules' }, { path: 'intravrf' }]
            }
          }
        },
        CookieService
      ]
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
