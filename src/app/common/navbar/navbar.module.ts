import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule } from '@angular/router';
import { IconButtonModule } from '../icon-button/icon-button.module';

@NgModule({
  declarations: [NavbarComponent],
  imports: [CommonModule, FontAwesomeModule, NgxSmartModalModule, RouterModule, IconButtonModule],
  exports: [NavbarComponent],
})
export class NavbarModule {}
