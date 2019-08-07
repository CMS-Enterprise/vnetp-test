import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IntraVrfRulesComponent } from './intra-vrf-rules.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { ContractModalComponent } from 'src/app/modals/contract-modal/contract-modal.component';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipComponent } from '../../tooltip/tooltip.component';

describe('IntraVrfRulesComponent', () => {
  let component: IntraVrfRulesComponent;
  let fixture: ComponentFixture<IntraVrfRulesComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule, NgxSmartModalModule,      FormsModule,
        ReactiveFormsModule,
      ],
      declarations: [ IntraVrfRulesComponent, ContractModalComponent, TooltipComponent ],
      providers: [{ provide: NgxSmartModalService, useValue: ngx}]
    })
    .compileComponents();
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
