import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { TableModule } from 'src/app/common/table/table.module';
import { RouterModule, Routes } from '@angular/router';
import { ChangeRequestModalComponent } from './change-request-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [ReactiveFormsModule, NgxSmartModalModule, FormsModule, CommonModule],
  declarations: [ChangeRequestModalComponent],
  exports: [ChangeRequestModalComponent],
})
export class ChangeRequestModalModule {}
