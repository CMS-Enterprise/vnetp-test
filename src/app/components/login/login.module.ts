import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { FormsModule } from '@angular/forms';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
];

@NgModule({
  imports: [CommonModule, FormsModule, FontAwesomeModule, RouterModule.forChild(routes)],
  declarations: [LoginComponent],
})
export class LoginModule {
  constructor(iconLibary: FaIconLibrary) {
    iconLibary.addIcons(faSpinner);
  }
}
