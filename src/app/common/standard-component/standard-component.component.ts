import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-standard-component',
  templateUrl: './standard-component.component.html',
  styleUrls: ['./standard-component.component.css'],
})
export class StandardComponentComponent implements OnInit {
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
  @Output() restoreObjectsFunc = new EventEmitter<any>();
  @Output() deleteObjectsFunc = new EventEmitter<any>();

  currentTier;
  ModalMode;

  @ViewChild('actionsTemplate') actionsTemplate: TemplateRef<any>;

  constructor() {}

  ngOnInit(): void {
    console.log('on init?', this.tableConfig);
  }

  searchParamsGetTableObjects(event?) {
    console.log('event', event);
    console.log('hit get table objects');
    this.searchParamsFunc.emit(event);
  }

  onTableEvent(event?) {
    console.log('event', event);
    console.log('hit on table event');
    this.tableEventFunc.emit();
  }

  importObjectsConfigFunction(event?) {
    console.log('event', event);
    console.log('hit import objects config');
    this.importObjectsFunc.emit(event);
  }

  clearResultsFunction(event?) {
    console.log('event', event);
    console.log('hit clear results func');
    this.clearResultsFunc.emit();
  }

  openObjectModal(modalMode, obj?) {
    console.log('modalMode', modalMode);
    console.log('hit openObjectModal func');
    this.openObjectModalFunc.emit();
  }

  tableEventFunction(event?) {
    console.log('event', event);
    console.log('hit tableEventFunction func');
    this.tableEventFunc.emit();
  }

  restoreObjectFunction(event?) {
    console.log('event', event);
    this.restoreObjectsFunc.emit();
  }

  deleteObjectFunction(event?) {
    console.log('event', event);
    this.deleteObjectsFunc.emit();
  }
}
