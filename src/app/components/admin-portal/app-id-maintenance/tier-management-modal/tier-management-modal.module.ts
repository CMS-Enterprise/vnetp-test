import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TierManagementModalComponent } from './tier-management-modal.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@NgModule({
  declarations: [TierManagementModalComponent],
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatSlideToggleModule,
  ],
  exports: [TierManagementModalComponent],
})
export class TierManagementModalModule {}
