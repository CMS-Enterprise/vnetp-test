import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { ConsumedContractsComponent } from './consumed-contracts.component';

describe('ConsumedContractsComponent', () => {
  let component: ConsumedContractsComponent;
  let fixture: ComponentFixture<ConsumedContractsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ConsumedContractsComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
      imports: [HttpClientModule, NgSelectModule, FormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsumedContractsComponent);
    component = fixture.componentInstance;
    component.endpointGroupId = 'uuid';
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
