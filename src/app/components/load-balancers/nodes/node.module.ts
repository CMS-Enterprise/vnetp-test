import { NgModule } from '@angular/core';
import { SharedModule } from 'src/app/common/shared.module';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NodeListComponent } from './node-list/node-list.component';
import { NodeModalComponent } from './node-modal/node-modal.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: NodeListComponent,
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
  declarations: [NodeListComponent, NodeModalComponent],
})
export class NodeModule {}
