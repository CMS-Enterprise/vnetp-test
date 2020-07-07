import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { WizardComponent } from './wizard.component';
import { ReplicationStatePanelComponent } from './side-panels/replication-state-panel/replication-state-panel.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PieChartModule, LineChartModule } from '@swimlane/ngx-charts';
import { NgxPaginationModule } from 'ngx-pagination';

const routes: Routes = [
  {
    path: '',
    component: WizardComponent,
  },
];

@NgModule({
  imports: [CommonModule, NgxPaginationModule, PieChartModule, LineChartModule, FontAwesomeModule, RouterModule.forChild(routes)],
  declarations: [WizardComponent, ReplicationStatePanelComponent],
})
export class WizardModule {}
