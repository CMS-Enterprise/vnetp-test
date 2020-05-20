import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DatacenterSelectComponent } from './datacenter-select.component';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CookieService } from 'ngx-cookie-service';
import { RouterTestingModule } from '@angular/router/testing';
import { ToastrModule } from 'ngx-toastr';
import { NgSelectModule } from '@ng-select/ng-select';

describe('DatacenterSelectComponent', () => {
  let component: DatacenterSelectComponent;
  let fixture: ComponentFixture<DatacenterSelectComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, NgxSmartModalModule, HttpClientTestingModule, RouterTestingModule.withRoutes([]), ToastrModule.forRoot()],
      declarations: [DatacenterSelectComponent],
      providers: [CookieService, { provide: NgxSmartModalService, useValue: ngx }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DatacenterSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
