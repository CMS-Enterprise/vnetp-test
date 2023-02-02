import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { EndpointGroupsModalComponent } from './endpoint-groups-modal.component';

describe('EndpointGroupsModalComponent', () => {
  let component: EndpointGroupsModalComponent;
  let fixture: ComponentFixture<EndpointGroupsModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        EndpointGroupsModalComponent,
        MockNgxSmartModalComponent,
        MockComponent({ selector: 'app-tabs', inputs: ['tabs', 'initialTabIndex'] }),
        MockComponent({ selector: 'app-consumed-contracts', inputs: ['endpointGroupId', 'tenantId'] }),
        MockComponent({ selector: 'app-provided-contracts', inputs: ['endpointGroupId', 'tenantId'] }),
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
      imports: [RouterTestingModule, HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointGroupsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
