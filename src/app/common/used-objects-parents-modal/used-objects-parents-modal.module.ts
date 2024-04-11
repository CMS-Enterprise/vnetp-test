import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from '../table/table.module';
import { UsedObjectsParentsModalComponent } from './used-objects-parents-modal.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';

@NgModule({
  imports: [TableModule, CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, NgxSmartModalModule],
  declarations: [UsedObjectsParentsModalComponent],
  exports: [UsedObjectsParentsModalComponent],
})
export class UsedObjectsParentsModalModule {}
