import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { PoolListComponent } from './pool-list/pool-list.component';
import { PoolModalComponent } from './pool-modal/pool-modal.component';
import { PoolRelationsComponent } from './pool-relations/pool-relations.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: PoolListComponent,
  },
  {
    path: 'relations',
    component: PoolRelationsComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TableModule,
    TooltipModule,
  ],
  declarations: [PoolListComponent, PoolModalComponent, PoolRelationsComponent],
})
export class PoolModule {}
