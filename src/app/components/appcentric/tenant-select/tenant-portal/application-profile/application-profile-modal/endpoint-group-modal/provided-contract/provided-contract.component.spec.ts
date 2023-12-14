import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockIconButtonComponent, MockFontAwesomeComponent, MockComponent, MockImportExportComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { ProvidedContractComponent } from './provided-contract.component';

describe('ProvidedContractsComponent', () => {
  let component: ProvidedContractComponent;
  let fixture: ComponentFixture<ProvidedContractComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ProvidedContractComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockImportExportComponent,
      ],
      imports: [HttpClientModule, NgSelectModule, FormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvidedContractComponent);
    component = fixture.componentInstance;
    component.endpointGroupId = 'uuid';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
