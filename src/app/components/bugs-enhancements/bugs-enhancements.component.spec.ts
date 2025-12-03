import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BugsEnhancementsComponent } from './bugs-enhancements.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { YesNoModalComponent } from 'src/app/common/yes-no-modal/yes-no-modal.component';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { V1MailService } from 'client';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';

describe('BugsEnhancementsComponent', () => {
  let component: BugsEnhancementsComponent;
  let fixture: ComponentFixture<BugsEnhancementsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([]), NgxPaginationModule, FormsModule, ReactiveFormsModule],
      declarations: [
        MockComponent({ selector: 'app-bugs-enhancements-view-modal', inputs: ['mail'] }),
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        BugsEnhancementsComponent,
        YesNoModalComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1MailService)],
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BugsEnhancementsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
