import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceObjectsGroupsComponent } from './service-objects-groups.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxMaskModule } from 'ngx-mask';
import { PapaParseModule } from 'ngx-papaparse';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NetworkObjectModalComponent } from 'src/app/modals/network-object-modal/network-object-modal.component';
import { NetworkObjectGroupModalComponent } from 'src/app/modals/network-object-group-modal/network-object-group-modal.component';
import { HttpClientModule, HttpHandler, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';

describe('ServicesObjectsGroupsComponent', () => {
  let component: ServiceObjectsGroupsComponent;
  let fixture: ComponentFixture<ServiceObjectsGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ AngularFontAwesomeModule,
        NgxSmartModalModule,
        NgxMaskModule,
        PapaParseModule,
        FormsModule,
        ReactiveFormsModule
      ],
     declarations: [
      ServiceObjectsGroupsComponent,
       NetworkObjectModalComponent,
       NetworkObjectGroupModalComponent],
     providers: [NgxSmartModalService, HttpClientModule, HttpClient, HttpHandler, CookieService, FormBuilder],
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
