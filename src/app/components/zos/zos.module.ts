import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ZosComponent } from './zos.component';
import { SharedModule } from 'src/app/common/shared.module';
import { IconButtonModule } from 'src/app/common/icon-button/icon-button.module';

const routes: Routes = [
  {
    path: '',
    component: ZosComponent,
  },
];

@NgModule({
  imports: [IconButtonModule, SharedModule, RouterModule.forChild(routes)],
  declarations: [ZosComponent],
})
export class ZosModule {}
