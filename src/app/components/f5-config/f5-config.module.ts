import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { F5ConfigComponent } from './f5-config.component';
import { PartitionDetailsComponent } from './partition-details/partition-details.component';
import { RouterModule } from '@angular/router';
import { F5ConfigCardComponent } from './f5-config-card/f5-config-card.component';
import { AuthGuard } from '../../guards/auth.guard';
import { HttpClientModule } from '@angular/common/http';
import { VirtualServerCardComponent } from './partition-details/virtual-server-card/virtual-server-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApplicationPipesModule } from '../../pipes/application-pipes.module';
import { F5ConfigFilterComponent } from './f5-config-filter/f5-config-filter.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';

const routes = [
  {
    path: '',
    component: F5ConfigComponent,
  },
  {
    path: 'partitions/:hostName',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Partition Details' },
    component: PartitionDetailsComponent,
  },
];

@NgModule({
  declarations: [F5ConfigComponent, PartitionDetailsComponent, F5ConfigCardComponent, VirtualServerCardComponent, F5ConfigFilterComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    HttpClientModule,
    FontAwesomeModule,
    ApplicationPipesModule,
    FormsModule,
    NgSelectModule,
  ],
  exports: [],
})
export class F5ConfigModule {}
