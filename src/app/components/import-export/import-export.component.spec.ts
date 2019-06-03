// FIXME: Test Inputs/Outputs.

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportExportComponent } from './import-export.component';
import { FormsModule } from '@angular/forms';
import { PapaParseModule } from 'ngx-papaparse';

describe('ImportExportComponent', () => {
  let component: ImportExportComponent;
  let fixture: ComponentFixture<ImportExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ FormsModule, PapaParseModule],
      declarations: [ ImportExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
