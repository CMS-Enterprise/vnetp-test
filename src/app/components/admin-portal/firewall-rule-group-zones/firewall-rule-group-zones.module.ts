import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { FirewallRuleGroupZonesModalComponent } from './firewall-rule-group-zones-modal/firewall-rule-group-zones-modal.component';
import { FirewallRuleGroupZonesComponent } from './firewall-rule-group-zones.component';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    IconButtonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TableModule,
    YesNoModalModule,
    NgxSmartModalModule,
    NgSelectModule,
  ],
  declarations: [FirewallRuleGroupZonesModalComponent, FirewallRuleGroupZonesComponent],
})
export class FirewallRuleGroupZonesModule {}
