import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NatRulesModule } from 'src/app/components/nat-rules/nat-rules.module';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'edit/:id',
    pathMatch: 'full',
  },
  {
    path: 'edit/:id',
    loadChildren: () => import('src/app/components/nat-rules/nat-rules.module').then(m => m.NatRulesModule),
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), NatRulesModule],
})
export class TenantV2NatModule {}
