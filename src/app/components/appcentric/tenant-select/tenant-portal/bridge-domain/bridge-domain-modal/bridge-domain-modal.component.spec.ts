import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NgSelectModule } from '@ng-select/ng-select';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockNgxSmartModalComponent, MockFontAwesomeComponent, MockComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { BridgeDomainModalComponent } from './bridge-domain-modal.component';

describe('BridgeDomainModalComponent', () => {
  let component: BridgeDomainModalComponent;
  let fixture: ComponentFixture<BridgeDomainModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        BridgeDomainModalComponent,
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockIconButtonComponent,
      ],
      imports: [NgSelectModule, FormsModule, ReactiveFormsModule, RouterTestingModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BridgeDomainModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
