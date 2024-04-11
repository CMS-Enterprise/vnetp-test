import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { EndpointGroupModalComponent } from './endpoint-group-modal.component';

describe('EndpointGroupModalComponent', () => {
  let component: EndpointGroupModalComponent;
  let fixture: ComponentFixture<EndpointGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        EndpointGroupModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-tabs', inputs: ['tabs', 'initialTabIndex'] }),
        MockComponent({ selector: 'app-consumed-contract', inputs: ['endpointGroupId', 'tenantId'] }),
        MockComponent({ selector: 'app-provided-contract', inputs: ['endpointGroupId', 'tenantId'] }),
      ],
      imports: [RouterTestingModule, ReactiveFormsModule, HttpClientModule, NgSelectModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EndpointGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
