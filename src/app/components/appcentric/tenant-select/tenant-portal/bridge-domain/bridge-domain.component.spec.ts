import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockNgxSmartModalComponent,
  MockFontAwesomeComponent,
  MockComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { BridgeDomainComponent } from './bridge-domain.component';

describe('BridgeDomainComponent', () => {
  let component: BridgeDomainComponent;
  let fixture: ComponentFixture<BridgeDomainComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BridgeDomainComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockComponent({ selector: 'app-bridge-domain-modal' }),
        MockComponent('app-subnets-modal'),
      ],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeDomainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
