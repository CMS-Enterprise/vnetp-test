import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ImportExportComponent } from './import-export.component';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Papa } from 'ngx-papaparse';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { FormsModule } from '@angular/forms';

class MockDomSanitizer {
  sanitize(ctx: any, value: any): SafeUrl {
    return value;
  }

  bypassSecurityTrustUrl(url: string): SafeUrl {
    return url;
  }
}

describe('ImportExportComponent', () => {
  let component: ImportExportComponent;
  let fixture: ComponentFixture<ImportExportComponent>;
  let sanitizer: DomSanitizer;
  let papa: Papa;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ImportExportComponent, MockFontAwesomeComponent],
      imports: [FormsModule],
      providers: [{ provide: DomSanitizer, useClass: MockDomSanitizer }, Papa],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportExportComponent);
    component = fixture.componentInstance;
    sanitizer = TestBed.inject(DomSanitizer);
    papa = TestBed.inject(Papa);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit imported data', () => {
    jest.spyOn(component.import, 'emit');
    const importObjects = [{ key: 'value' }];
    component.importCallback(importObjects);
    expect(component.import.emit).toHaveBeenCalledWith(importObjects);
  });

  it('should generate export URL for csv', () => {
    const exportObject = { key: 'value' };
    component.exportObject = exportObject;
    const exportType = 'csv';
    const csvContent = 'key\r\nvalue\r\n';
    jest.spyOn(papa, 'unparse').mockReturnValue(csvContent);
    jest.spyOn(sanitizer, 'bypassSecurityTrustUrl');
    component.exportFile(exportType);
    expect(papa.unparse).toHaveBeenCalledWith(exportObject);
    expect(sanitizer.bypassSecurityTrustUrl).toHaveBeenCalledWith(`data:text/csv;charset=UTF-8,${encodeURIComponent(csvContent)}`);
  });

  it('should call importCallback with imported data', fakeAsync(() => {
    const mockFile = new Blob(['data'], { type: 'text/csv' });
    /* eslint-disable-next-line */
    mockFile['name'] = 'file.csv';
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: () => mockFile,
    };
    const mockEvent = { target: { files: mockFileList } } as unknown;

    const importObjects = [{ key: 'value' }];

    jest.spyOn(component, 'importCallback').mockImplementation(() => {
      expect(component.importCallback).toHaveBeenCalledWith(importObjects);
    });

    jest.spyOn(component as any, 'Import').mockResolvedValueOnce((event, importCallback) => {
      importCallback(importObjects);
    });

    component.importFile(mockEvent as Event);
  }));

  it('should set currentDate to current ISO date and time', fakeAsync(() => {
    const mockDate = new Date('2023-05-01T10:30:45Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

    component.getDate();

    tick();
    expect(component.currentDate).toBe('2023-05-01T10:30:45');
  }));

  it('should call importCallback with JSON imported data', done => {
    const mockFile = new Blob(['{"key": "value"}'], { type: 'application/json' });
    // eslint-disable-next-line
    mockFile['name'] = 'file.json';
    const mockFileList = {
      0: mockFile,
      length: 1,
      item: () => mockFile,
    };
    const mockEvent = { target: { files: mockFileList } } as unknown;

    const importObjects = { key: 'value' };
    jest.spyOn(component, 'importCallback').mockImplementation(() => {
      expect(component.importCallback).toHaveBeenCalledWith(importObjects);
      done();
    });

    class MockFileReader {
      onload: (event: ProgressEvent) => void;
      result: string | ArrayBuffer;

      readAsText() {
        setTimeout(() => {
          this.result = '{"key": "value"}';
          this.onload(new ProgressEvent('load'));
        }, 0);
      }
    }

    jest.spyOn(window, 'FileReader').mockReturnValue(new MockFileReader() as any);

    component.importFile(mockEvent as Event);
  });

  //   it('should fail to import', fakeAsync(() => {
  //   component.disableCsv = true;
  //   const mockFile = new Blob(['data'], { type: 'text/csv' });
  //   /* eslint-disable-next-line */
  //   mockFile['name'] = 'file.csv';
  //   const mockFileList = {
  //     0: mockFile,
  //     length: 1,
  //     item: () => mockFile,
  //   };
  //   const mockEvent = { target: { files: mockFileList } } as unknown;

  //   const importObjects = [{ key: 'value' }];

  //   jest.spyOn(component, 'importCallback').mockImplementation(() => {
  //     expect(component.importCallback).toHaveBeenCalledWith(importObjects);
  //   });

  //   const tryThis = jest.spyOn(component as any, 'importFile').mockRejectedValue({Error})

  //   component.importFile(mockEvent as Event);
  //   expect(tryThis).toHaveBeenCalled()
  // }));
});
