import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { RouterModule } from '@angular/router';
import { DatacenterSelectComponent } from './components/datacenter-select/datacenter-select.component';
import { ToastrModule } from 'ngx-toastr';
import { FormsModule } from '@angular/forms';
import { TooltipModule } from '../tooltip/tooltip.module';

@NgModule({
  imports: [CommonModule, FontAwesomeModule, FormsModule, NgxSmartModalModule, RouterModule, ToastrModule, TooltipModule],
  declarations: [BreadcrumbComponent, DatacenterSelectComponent],
  exports: [BreadcrumbComponent, DatacenterSelectComponent],
})
export class BreadcrumbsModule {}
