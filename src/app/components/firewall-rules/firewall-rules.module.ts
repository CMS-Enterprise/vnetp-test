import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FirewallRulesComponent } from './firewall-rules.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSyncAlt } from '@fortawesome/free-solid-svg-icons';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import { NgxPaginationModule } from 'ngx-pagination';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { FilterPipe } from 'src/app/pipes/filter.pipe';

const routes: Routes = [
  {
    path: '',
    component: FirewallRulesComponent,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, NgxPaginationModule, FontAwesomeModule, NgxSmartModalModule, RouterModule.forChild(routes)],
  declarations: [FirewallRulesComponent, FilterPipe, YesNoModalComponent, TooltipComponent, ImportExportComponent],
})
export class FirewallRulesModule {
  constructor(iconLibary: FaIconLibrary) {
    iconLibary.addIcons(faSyncAlt, faSave);
  }
}
