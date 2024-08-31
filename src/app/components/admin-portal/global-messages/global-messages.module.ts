import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { GlobalMessagesModalComponent } from './global-messages-modal/global-messages-modal.component';
import { GlobalMessagesComponent } from './global-messages.component';

@NgModule({
  imports: [
    IconButtonModule,
    FontAwesomeModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TableModule,
    YesNoModalModule,
    NgxSmartModalModule,
  ],
  declarations: [GlobalMessagesModalComponent, GlobalMessagesComponent],
})
export class GlobalMessagesModule {}
