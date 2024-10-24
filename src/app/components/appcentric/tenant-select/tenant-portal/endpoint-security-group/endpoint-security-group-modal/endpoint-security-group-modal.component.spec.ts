import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndpointSecurityGroupModalComponent } from './endpoint-security-group-modal.component';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  V2AppCentricApplicationProfilesService,
  V2AppCentricBridgeDomainsService,
  V2AppCentricEndpointGroupsService,
} from '../../../../../../../../client';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
} from '../../../../../../../test/mock-components';
import { NgSelectModule } from '@ng-select/ng-select';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { MockProvider } from 'src/test/mock-providers';

describe('EndpointSecurityGroupModalComponent', () => {
  let component: EndpointSecurityGroupModalComponent;
  let fixture: ComponentFixture<EndpointSecurityGroupModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        EndpointSecurityGroupModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockImportExportComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockComponent({ selector: 'app-selector-modal', inputs: ['tenantId', 'endpointSecurityGroupId'] }),
      ],
      providers: [
        { provide: FormBuilder, useValue: jest.fn() },
        { provide: NgxSmartModalService, useValue: jest.fn() },
        { provide: V2AppCentricBridgeDomainsService, useValue: jest.fn() },
        { provide: V2AppCentricApplicationProfilesService, useValue: jest.fn() },
        MockProvider(V2AppCentricEndpointGroupsService),
      ],
      imports: [FormsModule, ReactiveFormsModule, NgSelectModule, HttpClientModule, RouterModule.forRoot([])],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointSecurityGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
