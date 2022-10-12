import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { SharedModule } from 'src/app/common/shared.module';
import { TableModule } from 'src/app/common/table/table.module';
import { TabsModule } from 'src/app/common/tabs/tabs.module';
import { SelfServiceArtifactReviewModalComponent } from './self-service-artifact-review-modal/self-service-artifact-review-modal.component';
import { SelfServiceModalComponent } from './self-service-modal/self-service-modal.component';
import { SelfServiceComponent } from './self-service.component';

const routes: Routes = [
  {
    path: '',
    component: SelfServiceComponent,
  },
];

@NgModule({
  imports: [
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    IconButtonModule,
    CommonModule,
    SharedModule,
    TableModule,
    RouterModule.forChild(routes),
    NgxSmartModalModule,
    TabsModule,
  ],
  declarations: [SelfServiceComponent, SelfServiceModalComponent, SelfServiceArtifactReviewModalComponent],
})
export class SelfServiceModule {}
