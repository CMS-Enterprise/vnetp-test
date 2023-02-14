import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationProfileComponent } from './application-profile.component';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationProfileModalComponent } from './application-profile-modal/application-profile-modal.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TableModule } from 'src/app/common/table/table.module';
import { ImportExportModule } from 'src/app/common/import-export/import-export.module';
import { YesNoModalModule } from 'src/app/common/yes-no-modal/yes-no-modal.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'src/app/common/tooltip/tooltip.module';
import { NgSelectModule } from '@ng-select/ng-select';
import { ApEndpointGroupModalComponent } from './application-profile-modal/ap-endpoint-group-modal/ap-endpoint-group-modal.component';

const routes: Routes = [
  {
    path: '',
    component: ApplicationProfileComponent,
  },
];

@NgModule({
  declarations: [ApplicationProfileComponent, ApplicationProfileModalComponent, ApEndpointGroupModalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    TableModule,
    ImportExportModule,
    YesNoModalModule,
    IconButtonModule,
    NgxSmartModalModule,
    FormsModule,
    ReactiveFormsModule,
    TooltipModule,
    NgSelectModule,
  ],
  exports: [ApplicationProfileComponent, ApplicationProfileModalComponent],
})
export class ApplicationProfileModule {}
