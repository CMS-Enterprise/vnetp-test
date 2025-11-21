import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { BugsEnhancementsComponent } from './bugs-enhancements.component';

const routes: Routes = [
  {
    path: '',
    component: BugsEnhancementsComponent,
  },
];

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes), TableModule, FontAwesomeModule, NgxSmartModalModule],
  declarations: [BugsEnhancementsComponent],
  exports: [BugsEnhancementsComponent],
})
export class BugsEnhancementsModule {}
