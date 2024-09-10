import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppIdRuntimeComponent } from './app-id-runtime.component';
import { AppIdRuntimeService } from './app-id-runtime.service';
import { NgxSmartModalModule } from 'ngx-smart-modal';

@NgModule({
  declarations: [AppIdRuntimeComponent],
  imports: [CommonModule, NgxSmartModalModule],
  providers: [AppIdRuntimeService],
  exports: [AppIdRuntimeService, AppIdRuntimeComponent],
})
export class AppIdRuntimeModule {}
