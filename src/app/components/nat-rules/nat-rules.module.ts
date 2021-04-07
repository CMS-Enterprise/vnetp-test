import { NgModule } from '@angular/core';
import { NatRuleGroupListComponent } from './nat-rule-group-list/nat-rule-group-list.component';
import { NatRulesRoutingModule } from './nat-rules-routing.module';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/common/shared.module';
import { NatRuleGroupModalComponent } from './nat-rule-group-modal/nat-rule-group-modal.component';
import { NatRuleListComponent } from './nat-rule-list/nat-rule-list.component';
import { NatRuleModalComponent } from './nat-rule-modal/nat-rule-modal.component';
import { NatRulesLandingComponent } from './nat-rules-landing/nat-rules-landing.component';

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
