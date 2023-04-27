import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormComponent } from './wan-form.component';
import {
  MockComponent,
  MockFontAwesomeComponent,
  MockIconButtonComponent,
  MockNgxSmartModalComponent,
  MockYesNoModalComponent,
} from 'src/test/mock-components';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';

describe('WanFormComponent', () => {
  let component: WanFormComponent;
  let fixture: ComponentFixture<WanFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WanFormComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockYesNoModalComponent,
        MockComponent('app-wan-form-modal'),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
      ],
      imports: [HttpClientModule, RouterTestingModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WanFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
