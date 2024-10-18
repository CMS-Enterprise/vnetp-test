import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirewallRuleGroupComponent } from './firewall-rule-group.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { CommonModule } from '@angular/common';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxPaginationModule } from 'ngx-pagination';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { TierSelectModule } from 'src/app/common/tier-select/tier-select.module';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { PreviewModalModule } from 'src/app/common/preview-modal/preview-modal.module';
// eslint-disable-next-line max-len
import { ApplicationPipesModule } from 'src/app/pipes/application-pipes.module';
import { FirewallRuleGroupModalComponent } from './firewall-rule-group-modal/firewall-rule-group-modal.component';

const routes: Routes = [
  {
    path: '',
    component: FirewallRuleGroupComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ApplicationPipesModule,
    ImportExportModule,
    FontAwesomeModule,
    NgxPaginationModule,
    YesNoModalModule,
    TierSelectModule,
    TableModule,
    IconButtonModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    NgSelectModule,
    PreviewModalModule,
  ],
  declarations: [FirewallRuleGroupComponent, FirewallRuleGroupModalComponent],
})
export class FirewallRuleGroupModule {}
