import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule } from '@angular/router';
import { IconButtonModule } from '../icon-button/icon-button.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RequestEnhancementModalComponent } from './request-enhancement-modal/request-enhancement-modal.component';
import { ReportIssueModalComponent } from './report-issue-modal/report-issue-modal.component';

@NgModule({
  declarations: [NavbarComponent, RequestEnhancementModalComponent, ReportIssueModalComponent],
  imports: [FormsModule, ReactiveFormsModule, CommonModule, FontAwesomeModule, NgxSmartModalModule, RouterModule, IconButtonModule],
  exports: [NavbarComponent],
})
export class NavbarModule {}
