import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';
import { MockProvider } from 'src/test/mock-providers';
import { ReportIssueModalComponent } from './report-issue-modal.component';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { V1MailService } from 'client';

describe('ReportIssueModalComponent', () => {
  let component: ReportIssueModalComponent;
  let fixture: ComponentFixture<ReportIssueModalComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReportIssueModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1MailService)],
    }).compileComponents();

    fixture = TestBed.createComponent(ReportIssueModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('save form', () => {
    beforeEach(() => {
      mockNgxSmartModalService = {
        getModal: jest.fn().mockReturnValue({ open: jest.fn(), close: jest.fn() }),
      };
      component['ngx'] = mockNgxSmartModalService as any;

      mockAuthService = {
        currentUserValue: jest.fn().mockReturnValue({ cn: 'mockUser' }) as any,
      };
      component['auth'] = mockAuthService as any;
    });

    it('should build form on init', () => {
      const mockBuildForm = jest.spyOn(component, 'buildForm');
      component.ngOnInit();
      expect(mockBuildForm).toHaveBeenCalled();
    });

    it('should call createOneMail and addUserInfo after form is submitted', () => {
      component.issueForm.controls.description.setValue('new description');
      component.issueForm.controls.component.setValue('FW Rules');
      const mockAddUserInfo = jest.spyOn(component, 'addUserInfo');
      component.saveFeedback();
      expect(mockAddUserInfo).toHaveBeenCalled();
    });

    it('should call createOneMail after form is submitted if form status is valid', () => {
      component.issueForm.controls.description.setValue('new description');
      component.issueForm.controls.component.setValue('FW Rules');
      const mockCreateOneMail = jest.spyOn(component['mailService'], 'createOneMail');
      component.saveFeedback();
      expect(mockCreateOneMail).toHaveBeenCalled();
    });
  });
});
