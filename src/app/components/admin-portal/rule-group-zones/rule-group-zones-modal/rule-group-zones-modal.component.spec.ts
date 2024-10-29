import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import {
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockNgSelectComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';
import { ModalMode } from 'src/app/models/other/modal-mode';
import { RuleGroupZonesModalComponent } from './rule-group-zones-modal.component';
import { V1NetworkSecurityZonesService, V1TiersService } from 'client';

describe('RuleGroupZonesModalComponent', () => {
  let component: RuleGroupZonesModalComponent;
  let fixture: ComponentFixture<RuleGroupZonesModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [
        RuleGroupZonesModalComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
        MockFontAwesomeComponent,
        MockNgSelectComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1NetworkSecurityZonesService), MockProvider(V1TiersService)],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(RuleGroupZonesModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call ngx.close with the correct argument when cancelled', () => {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    const ngx = component['ngx'];

    const ngxSpy = jest.spyOn(ngx, 'close');

    // eslint-disable-next-line @typescript-eslint/dot-notation
    component['closeModal']();

    expect(ngxSpy).toHaveBeenCalledWith('ruleGroupZonesModal');
  });

  it('should reset the form when closing the modal', () => {
    component.form.controls.name.setValue('Test');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(component.form.controls.name.value).toBe('');
  });

  it('should call to create a zone when the form is valid', () => {
    const service = TestBed.inject(V1NetworkSecurityZonesService);
    const createZoneSpy = jest.spyOn(service, 'createOneZone');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: 'Zone1',
      tier: '123',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createZoneSpy).toHaveBeenCalled();
  });

  it('should not call to create a zone when the form is invalid', () => {
    const service = TestBed.inject(V1NetworkSecurityZonesService);
    const createZoneSpy = jest.spyOn(service, 'createOneZone');

    component.modalMode = ModalMode.Create;
    component.form.setValue({
      name: '',
      tier: '',
    });

    const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
    saveButton.nativeElement.click();

    expect(createZoneSpy).not.toHaveBeenCalled();
  });

  describe('getData', () => {
    const createMessageDto = () => ({
      ModalMode: ModalMode.Edit,
    });
    it('should enable name field', () => {
      const ngx = TestBed.inject(NgxSmartModalService);
      jest.spyOn(ngx, 'getModalData').mockImplementation(() => createMessageDto());

      component.getData();

      expect(component.form.controls.name.enabled).toBe(true);
    });
  });
});
