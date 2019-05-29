import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Papa } from 'ngx-papaparse';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImportExportService {
  constructor(private sanitizer: DomSanitizer, private papa: Papa) {}

  public Import(importObject: any, importType: string, importCallback: Function): any {

    switch (importType) {
      case 'csv':
        const options = {
          header: true,
          complete: results => {
            importCallback(results.data);
          }
        };
        this.papa.parse(importObject, options);
        break;
      case 'json':
        importCallback(JSON.parse(importObject));
    }
  }

  public Export(exportObject: any, exportType: string): SafeUrl {
    switch (exportType) {
      case 'csv':
        const exportCsv = this.papa.unparse(exportObject);
        return this.sanitizer.bypassSecurityTrustUrl(
          'data:text/csv;charset=UTF-8,' + encodeURIComponent(exportCsv)
        );

      case 'json':
        const exportJson = JSON.stringify(exportObject);
        return this.sanitizer.bypassSecurityTrustUrl(
          'data:text/json;charset=UTF-8,' + encodeURIComponent(exportJson)
        );
    }
  }
}
