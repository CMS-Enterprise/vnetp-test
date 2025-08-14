import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantPortalComponent } from './tenant-portal.component';
import { TenantPortalRoutingModule } from './tenant-portal-routing.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@NgModule({
  imports: [CommonModule, FormsModule, TenantPortalRoutingModule, TabsModule, FontAwesomeModule],
  declarations: [TenantPortalComponent],
  exports: [TenantPortalComponent],
})
export class TenantPortalModule {}
