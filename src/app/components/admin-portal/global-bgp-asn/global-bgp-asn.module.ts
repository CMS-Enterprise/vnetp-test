import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalModule } from 'ngx-smart-modal';

import { TableModule } from 'src/app/common/table/table.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';
import { BgpAsnRangeModalComponent } from './ranges/bgp-asn-range-modal.component';
import { BgpAsnRangesComponent } from './ranges/bgp-asn-ranges.component';
import { BgpAsnAllocationsComponent } from './allocations/bgp-asn-allocations.component';
import { GlobalBgpAsnService } from './services/global-bgp-asn.service';
import { GlobalBgpAsnComponent } from './global-bgp-asn.component';

const routes: Routes = [
  { path: '', component: BgpAsnRangesComponent },
  { path: 'allocations', component: BgpAsnAllocationsComponent },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FontAwesomeModule,
    NgxSmartModalModule,
    TableModule,
    IconButtonModule,
    RouterModule.forChild(routes),
  ],
  declarations: [GlobalBgpAsnComponent, BgpAsnRangesComponent, BgpAsnRangeModalComponent, BgpAsnAllocationsComponent],
  exports: [GlobalBgpAsnComponent],
  providers: [GlobalBgpAsnService],
})
export class GlobalBgpAsnModule {}
