import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { ApplicationGroupListComponent } from './components/application-group-list/application-group-list.component';
import { ApplicationGroupModalComponent } from './components/application-group-modal/application-group-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApplicationPipesModule } from 'src/app/pipes/application-pipes.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: ApplicationGroupListComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    IconButtonModule,
    NgSelectModule,
    NgxSmartModalModule,
    RouterModule.forChild(routes),
    TableModule,
    ApplicationPipesModule,
    YesNoModalModule,
  ],
  declarations: [ApplicationGroupListComponent, ApplicationGroupModalComponent],
  exports: [ApplicationGroupListComponent, ApplicationGroupModalComponent],
})
export class ApplicationGroupModule {}
