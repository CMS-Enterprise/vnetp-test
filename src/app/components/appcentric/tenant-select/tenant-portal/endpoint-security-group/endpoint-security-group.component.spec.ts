import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { V2AppCentricEndpointSecurityGroupsService } from 'client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { TableContextService } from 'src/app/services/table-context.service';
import { MockFontAwesomeComponent, MockComponent, MockImportExportComponent, MockYesNoModalComponent } from 'src/test/mock-components';
import { EndpointSecurityGroupComponent } from './endpoint-security-group.component';

describe('EndpointSecurityGroupComponent', () => {
  let component: EndpointSecurityGroupComponent;
  let fixture: ComponentFixture<EndpointSecurityGroupComponent>;
  let mockRouter;

  beforeEach(async () => {
    mockRouter = {
      routerState: {
        snapshot: {
          url: '',
        },
      },
    };
    await TestBed.configureTestingModule({
      imports: [HttpClientModule],
      declarations: [
        EndpointSecurityGroupComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-endpoint-security-group-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        { provide: V2AppCentricEndpointSecurityGroupsService, useValue: jest.fn() },
        { provide: TableContextService, useValue: jest.fn() },
        { provide: NgxSmartModalService, useValue: jest.fn() },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointSecurityGroupComponent);
    component = fixture.componentInstance;
    jest.spyOn(component, 'getEndpointSecurityGroups').mockImplementation(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('getEndpointSecurityGroups', () => {
  //   beforeEach(() => {
  //     jest.spyOn(component, 'getEndpointSecurityGroups').mockRestore();
  //   });
  // });
});
