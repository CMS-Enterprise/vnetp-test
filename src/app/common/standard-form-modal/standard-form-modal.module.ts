import { NgModule } from '@angular/core';
import { TableModule } from '../table/table.module';
import { TableComponent } from '../table/table.component';
import { ImportExportModule } from '../import-export/import-export.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from '../icon-button/icon-button.module';
import { StandardFormModalComponent } from './standard-form-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [
    CommonModule,
    TableModule,
    ImportExportModule,
    FontAwesomeModule,
    IconButtonModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    NgSelectModule,
  ],
  exports: [StandardFormModalComponent],
  declarations: [StandardFormModalComponent],
})
export class StandardFormModalModule {}
