import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { RuleGroupZonesModalComponent } from './rule-group-zones-modal/rule-group-zones-modal.component';
import { RuleGroupZonesComponent } from './rule-group-zones.component';
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
  declarations: [RuleGroupZonesModalComponent, RuleGroupZonesComponent],
})
export class RuleGroupZonesModule {}
