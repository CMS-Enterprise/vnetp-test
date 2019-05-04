import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { PapaParseModule } from 'ngx-papaparse';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { HttpClientModule, HttpHandler, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ServiceObjectModalComponent } from 'src/app/modals/service-object-modal/service-object-modal.component';
import { ServiceObjectGroupModalComponent } from 'src/app/modals/service-object-group-modal/service-object-group-modal.component';

describe('ServicesObjectsGroupsComponent', () => {
  let component: ServiceObjectsGroupsComponent;
  let fixture: ComponentFixture<ServiceObjectsGroupsComponent>;

  const ngx: NgxSmartModalService = new NgxSmartModalService();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule,
        NgxSmartModalModule,
        NgxMaskModule.forRoot(),
        PapaParseModule,
        FormsModule,
        ReactiveFormsModule
      ],
     declarations: [
      ServiceObjectsGroupsComponent,
      ServiceObjectModalComponent,
      ServiceObjectGroupModalComponent
    ],
     providers: [{ provide: NgxSmartModalService, useValue: ngx}, HttpClientModule, HttpClient, HttpHandler, CookieService, FormBuilder],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ServiceObjectsGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
