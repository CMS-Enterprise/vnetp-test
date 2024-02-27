import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { ApplicationProfileComponent } from './application-profile.component';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';

describe('ApplicationProfileComponent', () => {
  let component: ApplicationProfileComponent;
  let fixture: ComponentFixture<ApplicationProfileComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        ApplicationProfileComponent,
        MockComponent({ selector: 'app-application-profile-modal', inputs: ['tenantId'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockNgxSmartModalComponent,
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockYesNoModalComponent,
        MockComponent('app-ap-endpoint-group-modal'),
      ],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ApplicationProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
