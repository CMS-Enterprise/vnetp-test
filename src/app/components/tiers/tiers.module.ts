import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { TiersComponent } from './tiers.component';
import { TierModalComponent } from './tier-modal/tier-modal.component';
import { ImportExportComponent } from 'src/app/common/import-export/import-export.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ResolvePipe } from 'src/app/pipes/resolve.pipe';

const routes: Routes = [
  {
    path: '',
    component: TiersComponent,
  },
];

@NgModule({
  imports: [CommonModule, NgxPaginationModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterModule.forChild(routes)],
  declarations: [
    TiersComponent,
    TierModalComponent,
    ImportExportComponent,
    ResolvePipe,
    NgxSmartModalComponent,
    TooltipComponent,
    YesNoModalComponent,
  ],
})
export class TiersModule {}
