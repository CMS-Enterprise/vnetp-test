import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndpointGroupComponent } from './endpoint-group.component';
import { V2AppCentricEndpointGroupsService } from '../../../../../../../client';
import { TableContextService } from '../../../../../services/table-context.service';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { Router } from '@angular/router';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from '../../../../../../test/mock-components';
import { HttpClientModule } from '@angular/common/http';

describe('EndpointGroupComponent', () => {
  let component: EndpointGroupComponent;
  let fixture: ComponentFixture<EndpointGroupComponent>;
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
        EndpointGroupComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-endpoint-group-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
        MockYesNoModalComponent,
      ],
      providers: [
        { provide: V2AppCentricEndpointGroupsService, useValue: jest.fn() },
        { provide: TableContextService, useValue: jest.fn() },
        { provide: NgxSmartModalService, useValue: jest.fn() },
        { provide: Router, useValue: mockRouter },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointGroupComponent);
    component = fixture.componentInstance;
    jest.spyOn(component, 'getEndpointGroups').mockImplementation(() => {});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // describe('getEndpointGroups', () => {
  //   beforeEach(() => {
  //     jest.spyOn(component, 'getEndpointGroups').mockRestore();
  //   });
  // });
});
