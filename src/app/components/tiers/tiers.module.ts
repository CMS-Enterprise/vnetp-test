import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TiersComponent } from './tiers.component';
import { TierModalComponent } from './tier-modal/tier-modal.component';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { TableModule } from '../../common/table/table.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { ApplicationPipesModule } from 'src/app/pipes/application-pipes.module';
import { TypeDeleteModalComponent } from './type-delete-modal/type-delete-modal.component';

const routes: Routes = [
  {
    path: '',
    component: TiersComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    ImportExportModule,
    IconButtonModule,
    YesNoModalModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    ApplicationPipesModule,
  ],
  declarations: [TiersComponent, TierModalComponent, TypeDeleteModalComponent],
  exports: [TiersComponent, TierModalComponent, TypeDeleteModalComponent],
})
export class TiersModule {}
