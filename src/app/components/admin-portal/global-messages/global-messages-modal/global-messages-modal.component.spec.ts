/* eslint-disable */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalMessagesModalComponent } from './global-messages-modal.component';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { V3GlobalMessagesService } from 'client';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { AuthService } from 'src/app/services/auth.service';
import { of } from 'rxjs';

describe('GlobalMessagesModalComponent', () => {
  let component: GlobalMessagesModalComponent;
  let fixture: ComponentFixture<GlobalMessagesModalComponent>;

  beforeEach(() => {
    const authService = {
      completeAuthentication: jest.fn(),
    };
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [GlobalMessagesModalComponent, MockNgxSmartModalComponent, MockIconButtonComponent, MockFontAwesomeComponent],
      providers: [
        { provide: AuthService, useValue: authService },
        MockProvider(NgxSmartModalService),
        MockProvider(V3GlobalMessagesService),
      ],
    });
    fixture = TestBed.createComponent(GlobalMessagesModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    const service = TestBed.inject(V3GlobalMessagesService);

    const authService = TestBed.inject(AuthService);
    authService.currentUser = of({ user: '123', dcsPermissions: [{ roles: 'role1' }] } as any);
    component['auth'].getTenants = jest.fn().mockReturnValue(of([{ tenant: 'tenant' }]) as any);

    component.ngOnInit();
  });

  describe('Description', () => {
    it('should have a minimum length of 1 and maximum length of 100', () => {
      const { description } = component.form.controls;

      description.setValue('a');
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(3));
      expect(description.valid).toBe(true);

      description.setValue('a'.repeat(101));
      expect(description.valid).toBe(false);
    });
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('globalMessagesModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.description.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.description.value).toBe('');
  });

  it('should call to create a message when the form is valid', () => {
    const service = TestBed.inject(V3GlobalMessagesService);
    const createMessageSpy = jest.spyOn(service, 'createOneMessage');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      messageType: 'General',
      description: 'Description',
      tenant: '',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createMessageSpy).toHaveBeenCalled();
  });

  it('should call to create a message with optional tenant param', () => {
    const service = TestBed.inject(V3GlobalMessagesService);
    const createMessageSpy = jest.spyOn(service, 'createOneMessage');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      messageType: 'General',
      description: 'Description',
      tenant: 'dcs_sandbox1_cms-east_000000000',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createMessageSpy).toHaveBeenCalled();
  });

  it('should not call to create a message when the form is invalid', () => {
    const service = TestBed.inject(V3GlobalMessagesService);
    const createMessageSpy = jest.spyOn(service, 'createOneMessage');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      messageType: '',
      description: '',
      tenant: '',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createMessageSpy).not.toHaveBeenCalled();
  });

  describe('getData', () => {
    const createMessageDto = () => ({
      ModalMode: ModalMode.Edit,
    });
    it('should enable description field', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createMessageDto());

      component.getData();

      expect(component.form.controls.description.enabled).toBe(true);
    });
  });
});
