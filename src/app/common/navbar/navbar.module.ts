import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule } from '@angular/router';
import { ChangeRequestModalModule } from 'src/app/components/change-request-modal/change-request-modal.module';
import { IconButtonModule } from '../icon-button/icon-button.module';

@NgModule({
  declarations: [NavbarComponent],
  imports: [ChangeRequestModalModule, CommonModule, FontAwesomeModule, NgxSmartModalModule, RouterModule, IconButtonModule],
  exports: [NavbarComponent],
})
export class NavbarModule {}
