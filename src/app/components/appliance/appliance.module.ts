import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ApplianceComponent } from './appliance.component';
import { ApplianceDetailComponent } from './appliance-detail/appliance-detail.component';
import { ApplianceModalComponent } from './appliance-modal/appliance-modal.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faSave } from '@fortawesome/free-regular-svg-icons';
import { faTrash, faUndo, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: ApplianceComponent,
  },
];

@NgModule({
  imports: [CommonModule, FontAwesomeModule, FormsModule, ReactiveFormsModule, NgxSmartModalModule, RouterModule.forChild(routes)],
  declarations: [ApplianceComponent, ApplianceDetailComponent, ApplianceModalComponent, YesNoModalComponent],
})
export class ApplianceModule {
  constructor(iconLibary: FaIconLibrary) {
    iconLibary.addIcons(faArrowLeft, faUndo, faTrash, faSave);
  }
}
