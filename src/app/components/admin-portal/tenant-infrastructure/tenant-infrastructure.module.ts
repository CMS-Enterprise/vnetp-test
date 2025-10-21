import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { NgSelectModule } from '@ng-select/ng-select';
import { TenantInfrastructureComponent } from './tenant-infrastructure.component';
import { YesNoModalModule } from '../../../common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [{ path: '', component: TenantInfrastructureComponent }];

@NgModule({
  declarations: [TenantInfrastructureComponent],
  imports: [CommonModule, FormsModule, FontAwesomeModule, ClipboardModule, NgSelectModule, YesNoModalModule, RouterModule.forChild(routes)],
})
export class TenantInfrastructureModule {}
