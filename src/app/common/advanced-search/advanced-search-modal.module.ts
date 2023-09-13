import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AdvancedSearchComponent } from './advanced-search-modal.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { IconButtonModule } from '../icon-button/icon-button.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [NgxSmartModalModule, CommonModule, NgSelectModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, IconButtonModule],
  declarations: [AdvancedSearchComponent],
  exports: [AdvancedSearchComponent],
})
export class AdvancedSearchModule {}
