import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ZosZvmRequestModalComponent } from './zos-zvm-request-modal.component';
import { MockFontAwesomeComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { of } from 'rxjs';
import { V1ConfigurationUploadService, ConfigurationUploadType } from 'api_client';
import { By } from '@angular/platform-browser';
import { MockProvider } from 'src/test/mock-providers';

describe('ZosZvmRequestModalComponent', () => {
  let component: ZosZvmRequestModalComponent;
  let fixture: ComponentFixture<ZosZvmRequestModalComponent>;

  beforeEach(async(() => {
    const configurationService = {
      v1ConfigurationUploadIdConfigurePatch: jest.fn(() => of({})),
      v1ConfigurationUploadPost: jest.fn(() => of({})),
    };

    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule],
      declarations: [ZosZvmRequestModalComponent, MockFontAwesomeComponent, MockNgxSmartModalComponent],
      providers: [MockProvider(NgxSmartModalService), { provide: V1ConfigurationUploadService, useValue: configurationService }],
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ZosZvmRequestModalComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
      });
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('save', () => {
    it('should call to save a z/OS request', () => {
      const service = TestBed.get(V1ConfigurationUploadService);

      component.uploadType = 'request';
      component.configurationType = ConfigurationUploadType.OS;
      component.form.controls.file.setValue('test');

      const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
      saveButton.nativeElement.click();

      expect(service.v1ConfigurationUploadPost).toHaveBeenCalledWith({
        configurationUpload: {
          type: ConfigurationUploadType.OS,
          file: 'test',
        },
      });
    });

    it('should call to configure a z/OS request', () => {
      const service = TestBed.get(V1ConfigurationUploadService);

      component.uploadId = '1';
      component.uploadType = 'configuration';
      component.configurationType = ConfigurationUploadType.OS;
      component.form.controls.file.setValue('test');

      const saveButton = fixture.debugElement.query(By.css('.btn.btn-success'));
      saveButton.nativeElement.click();

      expect(service.v1ConfigurationUploadIdConfigurePatch).toHaveBeenCalledWith({
        configurationDto: { configuration: 'test' },
        id: '1',
      });
    });

    it('should not call to create or update when the upload type is invalid', () => {
      const service = TestBed.get(V1ConfigurationUploadService);

      component.uploadId = '1';
      component.uploadType = 'something-else';
      component.configurationType = ConfigurationUploadType.OS;
      component.form.controls.file.setValue('test');

      expect(service.v1ConfigurationUploadIdConfigurePatch).not.toHaveBeenCalled();
      expect(service.v1ConfigurationUploadPost).not.toHaveBeenCalled();
    });
  });

  it('should call to close the modal when cancelling', () => {
    const service = TestBed.get(NgxSmartModalService);
    const closeSpy = jest.spyOn(service, 'close');

    const cancelButton = fixture.debugElement.query(By.css('.btn.btn-link'));
    cancelButton.nativeElement.click();

    expect(closeSpy).toHaveBeenCalled();
  });

  it('should setup the configuration modal', () => {
    const service = TestBed.get(NgxSmartModalService);
    jest.spyOn(service, 'getModalData').mockImplementation(() => {
      return {
        id: '1',
        type: ConfigurationUploadType.OS,
        uploadType: 'request',
      };
    });

    component.getData();

    expect(component.uploadId).toBe('1');
    expect(component.configurationType).toBe(ConfigurationUploadType.OS);
    expect(component.uploadType).toBe('request');
  });

  describe('importFile', () => {
    it('should not read a file when there is no file attached', () => {
      const readFileSpy = jest.spyOn(FileReader.prototype, 'readAsDataURL');

      component.importFile({ target: {} });
      expect(readFileSpy).not.toHaveBeenCalled();

      component.importFile({ target: { files: [] } });
      expect(readFileSpy).not.toHaveBeenCalled();
    });

    it('should read a file', () => {
      const readFileSpy = jest.spyOn(FileReader.prototype, 'readAsDataURL');

      const file = new Blob([], { type: 'text/html' });
      component.importFile({ target: { files: [file] } });
      expect(readFileSpy).toHaveBeenCalledWith(file);
    });
  });
});
