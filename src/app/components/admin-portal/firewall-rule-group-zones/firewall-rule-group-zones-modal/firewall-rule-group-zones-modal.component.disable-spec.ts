// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { FirewallRuleGroupZonesModalComponent } from './firewall-rule-group-zones-modal.component';
// import { MockProvider } from 'src/test/mock-providers';
// import { NgxSmartModalService } from 'ngx-smart-modal';
// import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
// import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { By } from '@angular/platform-browser';
// import { ModalMode } from 'src/app/models/other/modal-mode';

// describe('FirewallRuleGroupZonesModalComponent', () => {
//   let component: FirewallRuleGroupZonesModalComponent;
//   let fixture: ComponentFixture<FirewallRuleGroupZonesModalComponent>;

//   beforeEach(() => {
//     TestBed.configureTestingModule({
//       imports: [FormsModule, ReactiveFormsModule],
//       declarations: [FirewallRuleGroupZonesModalComponent, MockNgxSmartModalComponent, MockIconButtonComponent, MockFontAwesomeComponent],
//       providers: [MockProvider(NgxSmartModalService), MockProvider(V3FirewallRuleGroupZonesService)],
//     });
//     fixture = TestBed.createComponent(FirewallRuleGroupZonesModalComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });

//   describe('Description', () => {
//     it('should have a minimum length of 1 and maximum length of 100', () => {
//       const { description } = component.form.controls;

//       description.setValue('a');
//       expect(description.valid).toBe(true);

//       description.setValue('a'.repeat(3));
//       expect(description.valid).toBe(true);

//       description.setValue('a'.repeat(101));
//       expect(description.valid).toBe(false);
//     });
//   });

//   it('should call ngx.close with the correct argument when cancelled', () => {
//     // eslint-disable-next-line @typescript-eslint/dot-notation
//     const ngx = component['ngx'];

//     const ngxSpy = jest.spyOn(ngx, 'close');

//     // eslint-disable-next-line @typescript-eslint/dot-notation
//     component['closeModal']();

//     expect(ngxSpy).toHaveBeenCalledWith('globalMessagesModal');
//   });

//   it('should reset the form when closing the modal', () => {
//     component.form.controls.description.setValue('Test');

//     const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
//     cancelButton.nativeElement.click();

//     expect(component.form.controls.description.value).toBe('');
//   });

//   it('should call to create a message when the form is valid', () => {
//     const service = TestBed.inject(V3FirewallRuleGroupZonesService);
//     const createMessageSpy = jest.spyOn(service, 'createMessageMessage');

//     component.modalMode = ModalMode.Create;
//     component.form.setValue({
//       messageType: 'General',
//       description: 'Description',
//     });

//     const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
//     saveButton.nativeElement.click();

//     expect(createMessageSpy).toHaveBeenCalled();
//   });

//   it('should not call to create a message when the form is invalid', () => {
//     const service = TestBed.inject(V3FirewallRuleGroupZonesService);
//     const createMessageSpy = jest.spyOn(service, 'createMessageMessage');

//     component.modalMode = ModalMode.Create;
//     component.form.setValue({
//       messageType: '',
//       description: '',
//     });

//     const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
//     saveButton.nativeElement.click();

//     expect(createMessageSpy).not.toHaveBeenCalled();
//   });

//   describe('getData', () => {
//     const createMessageDto = () => ({
//       ModalMode: ModalMode.Edit,
//     });
//     it('should enable description field', () => {
//       const ngx = TestBed.inject(NgxSmartModalService);
//       jest.spyOn(ngx, 'getModalData').mockImplementation(() => createMessageDto());

//       component.getData();

//       expect(component.form.controls.description.enabled).toBe(true);
//     });
//   });
// });
