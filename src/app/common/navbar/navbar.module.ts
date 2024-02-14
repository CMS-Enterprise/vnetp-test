import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule } from '@angular/router';
import { ChangeRequestModalModule } from 'src/app/components/change-request-modal/change-request-modal.module';

@NgModule({
  declarations: [NavbarComponent],
  imports: [ChangeRequestModalModule, CommonModule, FontAwesomeModule, NgxSmartModalModule, RouterModule],
  exports: [NavbarComponent],
})
export class NavbarModule {}
