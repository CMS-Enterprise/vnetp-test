import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StandardComponentComponent } from './standard-component.component';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockImportExportComponent,
  MockNgxSmartModalComponent,
} from 'src/test/mock-components';

describe('StandardComponentComponent', () => {
  let component: StandardComponentComponent;
  let fixture: ComponentFixture<StandardComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        StandardComponentComponent,
        MockFontAwesomeComponent,
        MockNgxSmartModalComponent,
        MockIconButtonComponent,
        MockImportExportComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
      ],
    });
    fixture = TestBed.createComponent(StandardComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
