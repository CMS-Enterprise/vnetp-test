import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { AuthService } from 'src/app/services/auth.service';
import { MockProvider } from 'src/test/mock-providers';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { V1MailService } from 'client';
import { RequestEnhancementModalComponent } from './request-enhancement-modal.component';

describe('RequestEnhancementModalComponent', () => {
  let component: RequestEnhancementModalComponent;
  let fixture: ComponentFixture<RequestEnhancementModalComponent>;
  let mockAuthService: Partial<AuthService>;
  let mockNgxSmartModalService: Partial<NgxSmartModalService>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [RequestEnhancementModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      imports: [HttpClientModule, FormsModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1MailService)],
    }).compileComponents();

    fixture = TestBed.createComponent(RequestEnhancementModalComponent);
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
      component.rfeForm.controls.description.setValue('new description');
      component.rfeForm.controls.component.setValue('FW Rules');
      const mockAddUserInfo = jest.spyOn(component, 'addUserInfo');
      component.saveFeedback();
      expect(mockAddUserInfo).toHaveBeenCalled();
    });

    it('should call createOneMail after form is submitted if form status is valid', () => {
      component.rfeForm.controls.description.setValue('new description');
      component.rfeForm.controls.component.setValue('FW Rules');
      const mockCreateOneMail = jest.spyOn(component['mailService'], 'createOneEnhancementMail');
      component.saveFeedback();
      expect(mockCreateOneMail).toHaveBeenCalled();
    });
  });
});
