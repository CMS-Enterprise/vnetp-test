import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './navbar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule } from '@angular/router';
import { ChangeRequestModalModule } from 'src/app/components/change-request-modal/change-request-modal.module';
import { IconButtonModule } from '../icon-button/icon-button.module';
import { TooltipModule } from '../tooltip/tooltip.module';
import { YesNoModalModule } from '../yes-no-modal/yes-no-modal.module';

@NgModule({
  declarations: [NavbarComponent],
  imports: [
    YesNoModalModule,
    ChangeRequestModalModule,
    CommonModule,
    FontAwesomeModule,
    NgxSmartModalModule,
    RouterModule,
    IconButtonModule,
    TooltipModule,
  ],
  exports: [NavbarComponent],
})
export class NavbarModule {}
