import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalModule } from 'ngx-smart-modal';

import { EndpointDisplayModalComponent } from './endpoint-display-modal.component'; // Assuming the component is in the same directory

@NgModule({
  declarations: [EndpointDisplayModalComponent],
  imports: [CommonModule, FormsModule, NgxSmartModalModule],
  exports: [EndpointDisplayModalComponent],
})
export class EndpointDisplayModalModule {}
