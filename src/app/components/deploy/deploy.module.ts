import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DeployComponent } from './deploy.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';

const routes: Routes = [
  {
    path: '',
    component: DeployComponent,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, NgxSmartModalModule, RouterModule.forChild(routes)],
  declarations: [DeployComponent, YesNoModalComponent, ResolvePipe],
})
export class DeployModule {}
