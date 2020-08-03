import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZvmComponent } from './zvm.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: ZvmComponent,
  },
];

@NgModule({
  imports: [IconButtonModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [ZvmComponent],
})
export class ZvmModule {}
