import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ExternalFirewallsComponent } from './external-firewalls.component';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: ExternalFirewallsComponent,
  },
];

@NgModule({
  declarations: [ExternalFirewallsComponent],
  imports: [CommonModule, RouterModule.forChild(routes), FontAwesomeModule, TableModule, IconButtonModule],
  exports: [ExternalFirewallsComponent],
})
export class ExternalFirewallsModule {}
