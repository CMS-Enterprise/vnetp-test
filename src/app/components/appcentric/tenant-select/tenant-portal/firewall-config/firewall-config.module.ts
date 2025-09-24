import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirewallConfigComponent } from './firewall-config.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: FirewallConfigComponent,
  },
];

@NgModule({
  declarations: [FirewallConfigComponent],
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [FirewallConfigComponent],
})
export class FirewallConfigModule {}
