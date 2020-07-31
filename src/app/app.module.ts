// Angular Imports
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// 3rd-Party Imports
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import {
  faSave,
  faSignOutAlt,
  faPlus,
  faSyncAlt,
  faPencilAlt,
  faTrash,
  faUndo,
  faChevronRight,
  faChevronLeft,
  faUpload,
  faDownload,
  faChevronDown,
  faBolt,
  faBars,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons';
import { ToastrModule } from 'ngx-toastr';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { CookieService } from 'ngx-cookie-service';

// 1st-Party Imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpConfigInterceptor } from './interceptors/httpconfig.interceptor';
import { ApiModule, Configuration, ConfigurationParameters } from 'api_client';
import { environment } from 'src/environments/environment';
import { SharedModule } from './common/shared.module';
import { NavbarModule } from './common/navbar/navbar.module';
import { BreadcrumbsModule } from './common/breadcrumbs/breadcrumbs.module';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.apiBase,
  };
  return new Configuration(params);
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    ApiModule.forRoot(apiConfigFactory),
    AppRoutingModule,
    BreadcrumbsModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    HttpClientModule,
    NavbarModule,
    NgxMaskModule.forRoot(),
    NgxSmartModalModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      progressBar: true,
      closeButton: true,
      preventDuplicates: true,
    }),
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
    CookieService,
    Title,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(iconLibary: FaIconLibrary) {
    iconLibary.addIcons(
      faSave,
      faQuestionCircle,
      faPlus,
      faSyncAlt,
      faPencilAlt,
      faTrash,
      faUndo,
      faChevronRight,
      faUpload,
      faDownload,
      faChevronDown,
      faBolt,
      faBars,
      faSpinner,
      faSignOutAlt,
      faChevronLeft,
    );
  }
}
