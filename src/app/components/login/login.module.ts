import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from 'src/app/common/shared.module';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
];

@NgModule({
  imports: [SharedModule, RouterModule.forChild(routes)],
  declarations: [LoginComponent],
})
export class LoginModule {}
