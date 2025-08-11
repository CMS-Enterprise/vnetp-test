import { Component, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Papa, ParseConfig } from 'ngx-papaparse';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  standalone: false,
})
export class ImportExportComponent {
  downloadHref: SafeUrl;
  currentDate: string;
  fileInput: any;

  @Input() exportObject: any;
  @Input() exportFileName: string;

  @Input() disableJson?: boolean;
  @Input() disableCsv?: boolean;

  @Input() disableImport?: boolean;
  @Input() disableExport?: boolean;

  @Output() import = new EventEmitter<any>();

  constructor(private sanitizer: DomSanitizer, private papa: Papa) {}

  public importFile(event: Event): void {
    this.Import(event, importObjects => this.importCallback(importObjects));
  }

  importCallback(importObjects) {
    this.import.emit(importObjects);
    this.fileInput = '';
  }

  public exportFile(exportType: string): void {
    this.downloadHref = this.Export(this.exportObject, exportType);
  }

  getDate() {
    this.currentDate = new Date().toISOString().slice(0, 19);
  }

  private Import(evt: Event, importCallback: any): void {
    const files = (evt.target as HTMLInputElement).files;
    const file = files[0];
    const importType = file.name.split('.')[1];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
      const importObject = reader.result.toString();
      switch (importType) {
        case 'csv':
          if (this.disableCsv) {
            throw new Error('Invalid File Type');
          }
          const config: ParseConfig = {
            skipEmptyLines: true,
            header: true,
            complete: results => {
              importCallback(results.data);
            },
          };
          this.papa.parse(importObject, config);
          break;
        case 'json':
          if (this.disableJson) {
            throw new Error('Invalid File Type');
          }
          importCallback(JSON.parse(importObject));
          break;
        default:
          throw new Error('Invalid File Type');
      }
    };
  }

  private Export(exportObject: any, exportType: string): SafeUrl {
    if (exportObject.convertedConfig) {
      exportObject = exportObject.convertedConfig;
    }
    switch (exportType) {
      case 'csv':
        if (this.disableJson) {
          throw new Error('Invalid File Type');
        }
        const exportCsv = this.papa.unparse(exportObject);
        return this.sanitizer.bypassSecurityTrustUrl('data:text/csv;charset=UTF-8,' + encodeURIComponent(exportCsv));
      case 'json':
        if (this.disableJson) {
          throw new Error('Invalid File Type');
        }
        const exportJson = JSON.stringify(exportObject);
        return this.sanitizer.bypassSecurityTrustUrl('data:text/json;charset=UTF-8,' + encodeURIComponent(exportJson));
    }
  }
}
