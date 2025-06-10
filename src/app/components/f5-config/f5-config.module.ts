import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { F5ConfigComponent } from './f5-config.component';
import { PartitionDetailsComponent } from './partition-details/partition-details.component';
import { RouterModule } from '@angular/router';
import { F5ConfigCardComponent } from './f5-config-card/f5-config-card.component';
import { AuthGuard } from '../../guards/auth.guard';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { VirtualServerCardComponent } from './partition-details/virtual-server-card/virtual-server-card.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ApplicationPipesModule } from '../../pipes/application-pipes.module';
import { F5ConfigFilterComponent } from './f5-config-filter/f5-config-filter.component';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CertificateDetailsComponent } from './certificate-details/certificate-details.component';
import { LiteTableModule } from '../../common/lite-table/lite-table.module';

const routes = [
  {
    path: '',
    component: F5ConfigComponent,
  },
  {
    path: 'partitions/:id',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Partition Details' },
    component: PartitionDetailsComponent,
  },
  {
    path: 'certificates/:id',
    canActivate: [AuthGuard],
    data: { breadcrumb: 'Certificates' },
    component: CertificateDetailsComponent,
  },
];

@NgModule({
  declarations: [
    F5ConfigComponent,
    PartitionDetailsComponent,
    CertificateDetailsComponent,
    F5ConfigCardComponent,
    VirtualServerCardComponent,
    F5ConfigFilterComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FontAwesomeModule,
    ApplicationPipesModule,
    FormsModule,
    NgSelectModule,
    LiteTableModule,
  ],
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class F5ConfigModule {}
