import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TenantPortalComponent } from './tenant-portal.component';
import { TenantPortalRoutingModule } from './tenant-portal-routing.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TenantSidenavModule } from './tenant-sidenav/tenant-sidenav.module';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    TenantPortalRoutingModule,
    TabsModule,
    FontAwesomeModule,
    TenantSidenavModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    MatListModule,
    MatButtonModule,
  ],
  declarations: [TenantPortalComponent],
  exports: [TenantPortalComponent],
})
export class TenantPortalModule {}
