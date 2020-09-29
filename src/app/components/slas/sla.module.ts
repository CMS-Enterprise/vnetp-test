import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { SLALandingComponent } from './components/sla-landing/sla-landing.component';

const routes: Routes = [
  {
    path: '',
    component: SLALandingComponent,
  },
];

@NgModule({
  imports: [CommonModule, FontAwesomeModule, FormsModule, NgxSmartModalModule, RouterModule.forChild(routes), TableModule, TabsModule],
  declarations: [SLALandingComponent, ProfileListComponent, TemplateListComponent],
})
export class SlaModule {}
