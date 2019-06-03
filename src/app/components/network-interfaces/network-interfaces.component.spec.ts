import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkInterfacesComponent } from './network-interfaces.component';
import { LogicalInterfaceModalComponent } from 'src/app/modals/logical-interface-modal/logical-interface-modal.component';
import { FormsModule, ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { PapaParseModule } from 'ngx-papaparse';
import { ToastrModule } from 'ngx-toastr';
import { NgxMaskModule } from 'ngx-mask';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HttpClientModule, HttpHandler, HttpClient } from '@angular/common/http';
import { CookieService } from 'ngx-cookie-service';
import { ImportExportComponent } from '../import-export/import-export.component';

describe('NetworkInterfacesComponent', () => {
  let component: NetworkInterfacesComponent;
  let fixture: ComponentFixture<NetworkInterfacesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        NgxSmartModalModule,
        PapaParseModule,
        ToastrModule.forRoot(),
        NgxMaskModule.forRoot(),
        AngularFontAwesomeModule
      ],
      declarations: [
NetworkInterfacesComponent,
LogicalInterfaceModalComponent,
ImportExportComponent
      ],
      providers: [
        NgxSmartModalService,
        HttpClientModule,
        HttpClient,
        HttpHandler,
        CookieService,
        FormBuilder
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworkInterfacesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
