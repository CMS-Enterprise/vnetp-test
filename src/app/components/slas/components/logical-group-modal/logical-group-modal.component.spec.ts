import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import {
  V1AgmApplicationsService,
  V1AgmClustersService,
  V1AgmLogicalGroupsService,
  V1AgmProfilesService,
  V1AgmTemplatesService,
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
        MockProvider(V1AgmApplicationsService),
        MockProvider(V1AgmClustersService),
        MockProvider(V1AgmLogicalGroupsService),
        MockProvider(V1AgmProfilesService),
        MockProvider(V1AgmTemplatesService),
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
