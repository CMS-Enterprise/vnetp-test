// Angular Imports
import { BrowserModule, Title } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// 3rd-Party Imports
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faClone, faQuestionCircle } from '@fortawesome/free-regular-svg-icons';
import {
  faBars,
  faBolt,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faExclamationTriangle,
  faPencilAlt,
  faPlay,
  faPlus,
  faSave,
  faSearch,
  faSearchPlus,
  faSignOutAlt,
  faSpinner,
  faSyncAlt,
  faTable,
  faTrash,
  faUndo,
  faUpload,
} from '@fortawesome/free-solid-svg-icons';
import { ToastrModule } from 'ngx-toastr';
import { NgxSmartModalModule } from 'ngx-smart-modal';

// 1st-Party Imports
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpConfigInterceptor } from './interceptors/httpconfig.interceptor';
import { ApiModule, Configuration, ConfigurationParameters } from 'client';
import { environment } from 'src/environments/environment';
import { AppInitService } from './app.init';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavbarModule } from './common/navbar/navbar.module';
import { BreadcrumbsModule } from './common/breadcrumbs/breadcrumbs.module';

export function apiConfigFactory(): Configuration {
  const params: ConfigurationParameters = {
    basePath: environment.apiBase,
  };
  return new Configuration(params);
}

export function init_app(appLoadService: AppInitService) {
  return () => appLoadService.init();
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    ApiModule.forRoot(apiConfigFactory),
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FontAwesomeModule,
    FormsModule,
    HttpClientModule,
    NgxSmartModalModule.forRoot(),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      progressBar: true,
      closeButton: true,
      preventDuplicates: true,
    }),
    NavbarModule,
    BreadcrumbsModule,
  ],
  providers: [
    AppInitService,
    {
      provide: APP_INITIALIZER,
      useFactory: init_app,
      deps: [AppInitService],
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpConfigInterceptor,
      multi: true,
    },
    Title,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {
  constructor(iconLibary: FaIconLibrary) {
    iconLibary.addIcons(
      faBars,
      faBolt,
      faChevronDown,
      faChevronLeft,
      faChevronRight,
      faDownload,
      faExclamationTriangle,
      faPencilAlt,
      faPlay,
      faPlus,
      faQuestionCircle,
      faSave,
      faSearch,
      faSignOutAlt,
      faSpinner,
      faSyncAlt,
      faTable,
      faTrash,
      faUndo,
      faUpload,
      faSearchPlus,
      faClone,
    );
  }
}
