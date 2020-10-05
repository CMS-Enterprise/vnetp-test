import { CommonModule, DatePipe } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { RouterModule, Routes } from '@angular/router';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { TemplateListComponent } from './components/template-list/template-list.component';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { SLALandingComponent } from './components/sla-landing/sla-landing.component';
import { TemplateModalComponent } from './components/template-modal/template-modal.component';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: SLALandingComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    SharedModule,
    TableModule,
    TabsModule,
  ],
  declarations: [SLALandingComponent, ProfileListComponent, TemplateListComponent, TemplateModalComponent],
})
export class SlaModule {}
