import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ImportExportService } from 'src/app/services/import-export.service';

@Component({
  selector: 'app-import-export',
  templateUrl: './import-export.component.html',
  styleUrls: ['./import-export.component.css']
})
export class ImportExportComponent implements OnInit {

  importFileType: string;
  downloadHref;
  

  @Input() exportObjects: any;
  @Output() import = new EventEmitter<any>();


  constructor(private impexp: ImportExportService) { }

  ngOnInit() {
  }

  importFile(evt) {
    this.impexp.Import(evt, this.importFileType, rules => this.importCallback(rules));
  }

  importCallback(rules) {
    this.import.emit(rules);
    this.importFileType = '';
  }

  exportFile(exportType: string) {
    this.downloadHref = this.impexp.Export(this.exportObjects, exportType);
  }
}
