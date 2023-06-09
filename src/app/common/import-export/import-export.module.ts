import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImportExportComponent } from './import-export.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [ImportExportComponent],
  imports: [CommonModule, FontAwesomeModule, FormsModule],
  exports: [ImportExportComponent],
})
export class ImportExportModule {}
