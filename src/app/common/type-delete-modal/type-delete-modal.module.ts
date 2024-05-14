import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from '../table/table.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TypeDeleteModalComponent } from './type-delete-modal.component';

@NgModule({
  imports: [TableModule, CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, NgxSmartModalModule],
  declarations: [TypeDeleteModalComponent],
  exports: [TypeDeleteModalComponent],
})
export class TypeDeleteModalModule {}
