import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ZosComponent } from './zos.component';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockProvider } from 'src/test/mock-providers';
import { V1ConfigurationUploadService } from 'api_client';

describe('ZosComponent', () => {
  let component: ZosComponent;
  let fixture: ComponentFixture<ZosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, FormsModule, ReactiveFormsModule],
      declarations: [
        MockComponent({ selector: 'app-zos-zvm-request-modal' }),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        ZosComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1ConfigurationUploadService)],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
