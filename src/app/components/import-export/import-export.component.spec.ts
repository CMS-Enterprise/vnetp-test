import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportExportComponent } from './import-export.component';
import { FormsModule } from '@angular/forms';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

describe('ImportExportComponent', () => {
  let component: ImportExportComponent;
  let fixture: ComponentFixture<ImportExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [AngularFontAwesomeModule, FormsModule],
      declarations: [ImportExportComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset file input', () => {
    component.fileInput = '/some/file/path';
    component.importCallback({});
    expect(component.fileInput).toEqual('');
  });
});
