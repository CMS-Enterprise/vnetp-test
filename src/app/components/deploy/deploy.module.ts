import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeployComponent } from './deploy.component';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: DeployComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [DeployComponent],
})
export class DeployModule {}
