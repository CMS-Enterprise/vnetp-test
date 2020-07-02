import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from 'src/app/common/tooltip/tooltip.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxSmartModalComponent } from 'ngx-smart-modal';
import { StaticRoutesComponent } from './static-routes.component';
import { StaticRouteModalComponent } from './static-route-modal/static-route-modal.component';
import { StaticRouteDetailComponent } from './static-route-detail/static-route-detail.component';

const routes: Routes = [
  {
    path: '',
    component: StaticRoutesComponent,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, ReactiveFormsModule, FontAwesomeModule, RouterModule.forChild(routes)],
  declarations: [
    StaticRoutesComponent,
    StaticRouteModalComponent,
    StaticRouteDetailComponent,
    NgxSmartModalComponent,
    TooltipComponent,
    YesNoModalComponent,
  ],
})
export class StaticRoutesModule {}
