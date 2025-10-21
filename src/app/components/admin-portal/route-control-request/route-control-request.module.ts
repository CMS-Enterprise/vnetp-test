import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { TableModule } from '../../../common/table/table.module';
import { RouteControlRequestDetailComponent } from './route-control-request-detail/route-control-request-detail.component';
import { ResourceDetailsDialogComponent } from './route-control-request-detail/dialogs/resource-details-dialog.component';
import { RejectReasonDialogComponent } from './route-control-request-detail/dialogs/reject-reason-dialog.component';
import { SimpleConfirmDialogComponent } from './route-control-request-detail/dialogs/simple-confirm-dialog.component';
import { YesNoModalModule } from '../../../common/yes-no-modal/yes-no-modal.module';
import { RouteControlRequestComponent } from './route-control-request.component';

const routes: Routes = [
  {
    path: '',
    component: RouteControlRequestComponent,
  },
  {
    path: ':id',
    component: RouteControlRequestDetailComponent,
  },
];

@NgModule({
  declarations: [
    RouteControlRequestComponent,
    RouteControlRequestDetailComponent,
    ResourceDetailsDialogComponent,
    RejectReasonDialogComponent,
    SimpleConfirmDialogComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TableModule,
    MatExpansionModule,
    MatIconModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    YesNoModalModule,
  ],
  exports: [RouteControlRequestComponent],
})
export class RouteControlRequestModule {}
