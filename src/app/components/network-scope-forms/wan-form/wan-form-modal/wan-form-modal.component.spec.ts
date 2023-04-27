import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WanFormModalComponent } from './wan-form-modal.component';
import { HttpClientModule } from '@angular/common/http';
import { MockComponent, MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('WanFormModalComponent', () => {
  let component: WanFormModalComponent;
  let fixture: ComponentFixture<WanFormModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        WanFormModalComponent,
        MockComponent({ selector: 'app-table', inputs: ['config', 'data', 'itemsPerPage', 'searchColumns'] }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockComponent('app-external-route-modal'),
        MockNgxSmartModalComponent,
      ],
      imports: [HttpClientModule, ReactiveFormsModule, RouterTestingModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WanFormModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
