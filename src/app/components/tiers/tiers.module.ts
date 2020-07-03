import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiersComponent } from './tiers.component';
import { TierModalComponent } from './tier-modal/tier-modal.component';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: TiersComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [TiersComponent, TierModalComponent],
})
export class TiersModule {}
