import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ModalMode } from 'src/app/models/other/modal-mode';

@Component({
  selector: 'app-standard-component',
  templateUrl: './standard-component.component.html',
  styleUrls: ['./standard-component.component.css'],
})
export class StandardComponentComponent {
  @Input() tableData;
  @Input() tableConfig;
  @Input() objectSearchColumns;
  @Input() tableItemsPerPage;
  @Input() objectType;

  @Output() clearResultsFunc = new EventEmitter<any>();
  @Output() openObjectModalFunc = new EventEmitter<any>();
  @Output() tableEventFunc = new EventEmitter<any>();
  @Output() searchParamsFunc = new EventEmitter<any>();
  @Output() importObjectsFunc = new EventEmitter<any>();

  currentTier;

  constructor() {}

  searchParamsGetTableObjects(event?) {
    console.log('hit get table objects');
    this.searchParamsFunc.emit();
  }

  onTableEvent(event?) {
    console.log('hit on table event');
    this.tableEventFunc.emit();
  }

  importObjectsConfigFunction(event?) {
    console.log('hit import objects config');
    this.importObjectsFunc.emit();
  }

  clearResultsFunction() {
    console.log('hit clear results func');
    this.clearResultsFunc.emit();
  }

  openObjectModal() {
    console.log('hit openObjectModal func');
    this.openObjectModalFunc.emit();
  }

  tableEventFunction() {
    console.log('hit tableEventFunction func');
    this.tableEventFunc.emit();
  }
}
