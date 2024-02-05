import { NgModule } from '@angular/core';
import { StandardComponentComponent } from './standard-component.component';
import { TableModule } from '../table/table.module';
import { TableComponent } from '../table/table.component';
import { ImportExportModule } from '../import-export/import-export.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [TableModule, ImportExportModule, FontAwesomeModule],
  exports: [StandardComponentComponent],
  declarations: [StandardComponentComponent],
})
export class StandardComponentModule {}
