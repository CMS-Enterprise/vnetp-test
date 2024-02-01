import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { ConsumedContractComponent } from './consumed-contract.component';

describe('ConsumedContractsComponent', () => {
  let component: ConsumedContractComponent;
  let fixture: ComponentFixture<ConsumedContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConsumedContractComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
      imports: [HttpClientModule, NgSelectModule, FormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumedContractComponent);
    component = fixture.componentInstance;
    component.endpointGroupId = 'uuid';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
