import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { SelfIpListComponent } from './self-ip-list/self-ip-list.component';
import { SelfIpModalComponent } from './self-ip-modal/self-ip-modal.component';
import { RouterModule, Routes } from '@angular/router';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: SelfIpListComponent,
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
  declarations: [SelfIpListComponent, SelfIpModalComponent],
})
export class SelfIpModule {}
