import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIdRuntimeComponent } from './app-id-runtime.component';
import { AppIdRuntimeService } from './app-id-runtime.service';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { AppIdTableComponent } from './app-id-table/app-id-table.component';
import { YesNoModalModule } from '../../common/yes-no-modal/yes-no-modal.module';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialogModule } from '@angular/material/dialog';
import { PanosApplicationDetailsDialogComponent } from './panos-application-details-dialog/panos-application-details-dialog.component';
import { MatTableModule } from '@angular/material/table';

@NgModule({
  declarations: [AppIdRuntimeComponent, AppIdTableComponent, PanosApplicationDetailsDialogComponent],
  imports: [CommonModule, NgxSmartModalModule, YesNoModalModule, FormsModule, MatTooltipModule, MatDialogModule, MatTableModule],
  providers: [AppIdRuntimeService],
  exports: [AppIdRuntimeComponent, AppIdTableComponent, PanosApplicationDetailsDialogComponent],
})
export class AppIdRuntimeModule {}
