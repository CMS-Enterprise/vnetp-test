import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  V1ActifioGmApplicationsService,
  V1ActifioGmClustersService,
  V1ActifioGmLogicalGroupsService,
  V1ActifioGmProfilesService,
  V1ActifioGmTemplatesService,
} from 'api_client';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockYesNoModalComponent,
  MockIconButtonComponent,
  MockFontAwesomeComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { LogicalGroupModalComponent } from './logical-group-modal.component';

describe('LogicalGroupModalComponent', () => {
  let component: LogicalGroupModalComponent;
  let fixture: ComponentFixture<LogicalGroupModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, NgSelectModule],
      declarations: [
        MockNgxSmartModalComponent,
        MockYesNoModalComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        LogicalGroupModalComponent,
      ],
      providers: [
        MockProvider(NgxSmartModalService),
        MockProvider(V1ActifioGmApplicationsService),
        MockProvider(V1ActifioGmClustersService),
        MockProvider(V1ActifioGmLogicalGroupsService),
        MockProvider(V1ActifioGmProfilesService),
        MockProvider(V1ActifioGmTemplatesService),
      ],
    });
    fixture = TestBed.createComponent(LogicalGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
