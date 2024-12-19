import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FirewallRulesComponent } from './firewall-rules.component';
import { FirewallRulesDetailComponent } from './firewall-rules-detail/firewall-rules-detail.component';
import { AuthGuard } from 'src/app/guards/auth.guard';
import { CommonModule } from '@angular/common';
import { ApplicationPipesModule } from '../../pipes/application-pipes.module';
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
import { FirewallRulePacketTracerComponent } from './firewall-rule-packet-tracer/firewall-rule-packet-tracer.component';
import { FirewallRuleModalComponent } from './firewall-rule-modal/firewall-rule-modal.component';
import { PreviewModalModule } from 'src/app/common/preview-modal/preview-modal.module';
// eslint-disable-next-line max-len
import { FirewallRuleObjectInfoModalComponent } from './firewall-rule-modal/firewall-rule-object-info-modal/firewall-rule-object-info-modal.component';
import { FirewallRulesOperationModalComponent } from './firewall-rules-operation-modal/firewall-rules-operation-modal.component';
import { AppIdRuntimeModule } from '../app-id-runtime/app-id-runtime.module';
import { LiteTableModule } from '../../common/lite-table/lite-table.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';

const routes: Routes = [
  {
    path: '',
    component: FirewallRulesComponent,
  },
  {
    path: 'edit/:id',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Firewall Rule Group' },
    component: FirewallRulesDetailComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ApplicationPipesModule,
    ImportExportModule,
    ApplicationPipesModule,
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
    AppIdRuntimeModule,
    LiteTableModule,
    MatSidenavModule,
    MatDialogModule,
    MatTooltipModule,
    MatIconModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    MatRadioModule,
    MatInputModule,
    MatMenuModule,
  ],
  declarations: [
    FirewallRulesComponent,
    FirewallRulesDetailComponent,
    FirewallRuleModalComponent,
    FirewallRulePacketTracerComponent,
    FirewallRuleObjectInfoModalComponent,
    FirewallRulesOperationModalComponent,
  ],
})
export class FirewallRulesModule {}
