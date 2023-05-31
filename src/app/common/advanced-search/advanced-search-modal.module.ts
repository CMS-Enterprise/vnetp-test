import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AdvancedSearchComponent } from './advanced-search-modal.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from '../shared.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [NgxSmartModalModule, CommonModule, SharedModule, FormsModule, ReactiveFormsModule],
  declarations: [AdvancedSearchComponent],
  exports: [AdvancedSearchComponent],
})
export class AdvancedSearchModule {}
