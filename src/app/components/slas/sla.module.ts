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
import { SlaLandingComponent } from './components/sla-landing/sla-landing.component';
import { TemplateModalComponent } from './components/template-modal/template-modal.component';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { LogicalGroupListComponent } from './components/logical-group-list/logical-group-list.component';
import { LogicalGroupViewModalComponent } from './components/logical-group-view-modal/logical-group-view-modal.component';
import { LogicalGroupModalComponent } from './components/logical-group-modal/logical-group-modal.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';

const routes: Routes = [
  {
    path: '',
    component: SlaLandingComponent,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FontAwesomeModule,
    FormsModule,
    IconButtonModule,
    NgSelectModule,
    NgxSmartModalModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
    TableModule,
    TabsModule,
    YesNoModalModule,
  ],
  declarations: [
    LogicalGroupListComponent,
    LogicalGroupModalComponent,
    LogicalGroupViewModalComponent,
    ProfileListComponent,
    SlaLandingComponent,
    TemplateListComponent,
    TemplateModalComponent,
  ],
  exports: [
    LogicalGroupListComponent,
    LogicalGroupModalComponent,
    LogicalGroupViewModalComponent,
    ProfileListComponent,
    SlaLandingComponent,
    TemplateListComponent,
    TemplateModalComponent,
  ],
  providers: [DatePipe],
})
export class SlaModule {}
