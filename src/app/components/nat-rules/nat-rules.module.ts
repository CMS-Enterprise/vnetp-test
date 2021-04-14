import { NgModule } from '@angular/core';
import { NatRuleGroupListComponent } from './nat-rule-group-list/nat-rule-group-list.component';
import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/common/shared.module';
import { NatRuleGroupModalComponent } from './nat-rule-group-modal/nat-rule-group-modal.component';
import { NatRuleListComponent } from './nat-rule-list/nat-rule-list.component';
import { TabsModule } from '../../common/tabs/tabs.module';
import { TooltipModule } from '../../common/tooltip/tooltip.module';
import { AuthGuard } from '../../guards/auth.guard';
import { NatRuleDetailComponent } from './nat-rules-detail/nat-rule-detail.component';
import { NatRuleModalComponent } from './nat-rule-modal/nat-rule-modal.component';
import { IconButtonModule } from '../../common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: NatRuleListComponent,
  },
  {
    path: 'edit/:id',
    component: NatRuleDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Nat Rule Group' },
  },
];

@NgModule({
  declarations: [
    NatRuleGroupListComponent,
    NatRuleGroupModalComponent,
    NatRuleListComponent,
    NatRuleModalComponent,
    NatRuleDetailComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    IconButtonModule,
    ReactiveFormsModule,
    RouterModule,
    FontAwesomeModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    SharedModule,
    TabsModule,
    TooltipModule,
    RouterModule.forChild(routes),
  ],
})
export class NatRulesModule {}
