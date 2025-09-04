import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TenantInfrastructureComponent } from './tenant-infrastructure.component';

const routes: Routes = [{ path: '', component: TenantInfrastructureComponent }];

@NgModule({
  declarations: [TenantInfrastructureComponent],
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule.forChild(routes)],
})
export class TenantInfrastructureModule {}
