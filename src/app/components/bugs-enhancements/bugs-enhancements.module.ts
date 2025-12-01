import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { BugsEnhancementsComponent } from './bugs-enhancements.component';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { BugsEnhancementsViewModalComponent } from './bugs-enhancements-view-modal/bugs-enhancements-view-modal.component';

const routes: Routes = [
  {
    path: '',
    component: BugsEnhancementsComponent,
  },
];

@NgModule({
  imports: [
    YesNoModalModule,
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    FontAwesomeModule,
    NgxSmartModalModule,
    IconButtonModule,
  ],
  declarations: [BugsEnhancementsComponent, BugsEnhancementsViewModalComponent],
  exports: [BugsEnhancementsComponent],
})
export class BugsEnhancementsModule {}
