import { NgModule } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { CommonModule } from '@angular/common';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { TabsModule } from '../../common/tabs/tabs.module';
import { TooltipModule } from '../../common/tooltip/tooltip.module';
import { AuthGuard } from '../../guards/auth.guard';
import { NatRulesDetailComponent } from './nat-rules-detail/nat-rules-detail.component';
import { NatRuleModalComponent } from './nat-rule-modal/nat-rule-modal.component';
import { IconButtonModule } from '../../common/icon-button/icon-button.module';
import { NatRulesComponent } from './nat-rules.component';
import { PreviewModalModule } from '../../common/preview-modal/preview-modal.module';
import { TableModule } from 'src/app/common/table/table.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApplicationPipesModule } from 'src/app/pipes/application-pipes.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { TierSelectModule } from 'src/app/common/tier-select/tier-select.module';
import { NatRuleObjectInfoModalComponent } from './nat-rule-modal/nat-rule-object-info-modal/nat-rule-object-info-modal.component';
import { NatRulePacketTracerComponent } from './nat-rule-packet-tracer/nat-rule-packet-tracer.component';

const routes: Routes = [
  {
    path: '',
    component: NatRulesComponent,
  },
  {
    path: 'edit/:id',
    component: NatRulesDetailComponent,
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Nat Rule Group' },
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    FontAwesomeModule,
    NgxPaginationModule,
    NgxSmartModalModule,
    PreviewModalModule,
    ReactiveFormsModule,
    TableModule,
    TabsModule,
    TooltipModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    ApplicationPipesModule,
    YesNoModalModule,
    ImportExportModule,
    TierSelectModule,
  ],
  declarations: [
    NatRulesComponent,
    NatRuleModalComponent,
    NatRulesDetailComponent,
    NatRuleObjectInfoModalComponent,
    NatRulePacketTracerComponent,
  ],
})
export class NatRulesModule {}
