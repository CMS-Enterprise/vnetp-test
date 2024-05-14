import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { V2AppCentricTenantsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { TenantSelectComponent } from './tenant-select.component';

describe('TenantSelectComponent', () => {
  let component: TenantSelectComponent;
  let fixture: ComponentFixture<TenantSelectComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        TenantSelectComponent,
        MockComponent('app-tenant-select-modal'),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockComponent({ selector: 'app-type-delete-modal', inputs: ['objectToDelete', 'objectType'] }),
      ],
      imports: [RouterModule, RouterTestingModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V2AppCentricTenantsService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TenantSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
