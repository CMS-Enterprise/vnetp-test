import { NgModule } from '@angular/core';
import { NatRuleGroupListComponent } from './components/nat-rule-group-list/nat-rule-group-list.component';
import { NatRulesRoutingModule } from './nat-rules-routing.module';
import { NatRuleGroupModalComponent } from './components/nat-rule-group-modal/nat-rule-group-modal.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NatRulesLandingComponent } from './components/nat-rules-landing/nat-rules-landing.component';
import { NatRuleListComponent } from './components/nat-rule-list/nat-rule-list.component';
import { NatRuleModalComponent } from './components/nat-rule-modal/nat-rule-modal.component';
import { SharedModule } from 'src/app/common/shared.module';

@NgModule({
  declarations: [
    NatRuleGroupListComponent,
    NatRuleGroupModalComponent,
    NatRuleListComponent,
    NatRuleModalComponent,
    NatRulesLandingComponent,
  ],
  imports: [
    CommonModule,
    NatRulesRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    SharedModule,
  ],
})
export class NatRulesModule {}
