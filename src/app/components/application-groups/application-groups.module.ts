import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { ApplicationGroupListComponent } from './components/application-group-list/application-group-list.component';
import { ApplicationGroupModalComponent } from './components/application-group-modal/application-group-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { SortPipe } from 'src/app/pipes/sort.pipe';

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
    SharedModule,
    TableModule,
  ],
  declarations: [ApplicationGroupListComponent, ApplicationGroupModalComponent, SortPipe],
})
export class ApplicationGroupModule {}
