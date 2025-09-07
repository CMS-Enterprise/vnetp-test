import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TenantSidenavComponent } from './tenant-sidenav.component';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';

@NgModule({
  declarations: [TenantSidenavComponent],
  imports: [CommonModule, FormsModule, FontAwesomeModule, TooltipModule],
  exports: [TenantSidenavComponent],
})
export class TenantSidenavModule {}
