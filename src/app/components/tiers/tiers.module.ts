import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiersComponent } from './tiers.component';
import { TierModalComponent } from './tier-modal/tier-modal.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: TiersComponent,
  },
];

@NgModule({
  imports: [IconButtonModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [TiersComponent, TierModalComponent],
})
export class TiersModule {}
