import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantPortalComponent } from './tenant-portal.component';
import { TenantPortalRoutingModule } from './tenant-portal-routing.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TenantSidenavModule } from './tenant-sidenav/tenant-sidenav.module';

@NgModule({
  imports: [CommonModule, FormsModule, TenantPortalRoutingModule, TabsModule, FontAwesomeModule, TenantSidenavModule],
  declarations: [TenantPortalComponent],
  exports: [TenantPortalComponent],
})
export class TenantPortalModule {}
