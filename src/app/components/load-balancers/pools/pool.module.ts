import { NgModule } from '@angular/core';
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
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

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
    TableModule,
    TooltipModule,
    ImportExportModule,
    YesNoModalModule,
  ],
  declarations: [PoolListComponent, PoolModalComponent, PoolRelationsComponent],
})
export class PoolModule {}
