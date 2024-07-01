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
  faCheck,
  faChevronDown,
  faChevronLeft,
  faChevronRight,
  faDownload,
  faExclamationTriangle,
  faFilter,
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
  faTimes,
  faTrash,
  faUndo,
  faUpload,
  faAsterisk,
  faCog,
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
import { NewDashboardComponent } from './new-dashboard/new-dashboard.component';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { NewTableComponent } from './new-table/new-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

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
  declarations: [AppComponent, NewTableComponent],
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
    MatGridListModule,
    MatCardModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
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
      faFilter,
      faExclamationTriangle,
      faAsterisk,
      faClone,
      faCheck,
      faTimes,
      faCog,
      faChevronLeft,
    );
  }
}
