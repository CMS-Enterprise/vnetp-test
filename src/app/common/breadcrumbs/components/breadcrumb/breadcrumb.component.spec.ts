import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BreadcrumbComponent } from './breadcrumb.component';
import { RouterTestingModule } from '@angular/router/testing';
import { CookieService } from 'ngx-cookie-service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { DatacenterSelectComponent } from '../datacenter-select/datacenter-select.component';
import { MockProvider } from 'src/test/mock-providers';
import { MockNgxSmartModalComponent } from 'src/test/mock-components';
import { ToastrService } from 'ngx-toastr';

describe('BreadcrumbComponent', () => {
  let component: BreadcrumbComponent;
  let fixture: ComponentFixture<BreadcrumbComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), HttpClientTestingModule, FormsModule],
      declarations: [BreadcrumbComponent, DatacenterSelectComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), MockProvider(ToastrService), CookieService],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(BreadcrumbComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
