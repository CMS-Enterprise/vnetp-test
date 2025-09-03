import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { WanFormRequestComponent } from './wan-form-request.component';
import { TableModule } from '../../../common/table/table.module';
import { WanFormRequestDetailComponent } from './wan-form-request-detail/wan-form-request-detail.component';
import { YesNoModalModule } from '../../../common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: WanFormRequestComponent,
  },
  {
    path: ':id',
    component: WanFormRequestDetailComponent,
  },
];

@NgModule({
  declarations: [WanFormRequestComponent, WanFormRequestDetailComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    YesNoModalModule,
  ],
  exports: [WanFormRequestComponent],
})
export class WanFormRequestModule {}
