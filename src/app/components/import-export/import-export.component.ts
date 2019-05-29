import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Papa } from 'ngx-papaparse';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent implements OnInit {

  importFileType: string;
  downloadHref: SafeUrl;

  @Input() exportObject: any;
  @Output() import = new EventEmitter<any>();


  constructor(private sanitizer: DomSanitizer, private papa: Papa) { }

  ngOnInit() {
  }

  importFile(evt) {
    this.Import(evt, rules => this.importCallback(rules));
  }

  importCallback(rules) {
    this.import.emit(rules);
    this.importFileType = '';
  }

  exportFile(exportType: string) {
    this.downloadHref = this.Export(this.exportObject, exportType);
  }

  private Import(evt: any, importCallback: any): any {
    const files = evt.target.files;
    const file = files[0];
    const importType = file.name.split('.')[1];
    const reader = new FileReader();
    reader.readAsText(file);
    reader.onload = () => {
        const importObject = reader.result.toString();

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
    };
  }

  private Export(exportObject: any, exportType: string): SafeUrl {
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
