import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DeployComponent } from './deploy.component';
import { CommonModule } from '@angular/common';
import { ApplicationPipesModule } from '../../pipes/application-pipes.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { FormsModule } from '@angular/forms';
import { IconButtonModule } from '../../common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: DeployComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ApplicationPipesModule,
    FontAwesomeModule,
    YesNoModalModule,
    FormsModule,
    IconButtonModule,
  ],
  declarations: [DeployComponent],
  exports: [DeployComponent],
})
export class DeployModule {}
