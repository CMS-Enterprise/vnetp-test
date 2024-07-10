import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AciRuntimeComponent } from './aci-runtime.component';
import { LiteTableModule } from '../../common/lite-table/lite-table.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  declarations: [AciRuntimeComponent],
  imports: [CommonModule, LiteTableModule, FontAwesomeModule],
  exports: [AciRuntimeComponent],
})
export class AciRuntimeModule {}
