import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ZvmComponent } from './zvm.component';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MockProvider } from 'src/test/mock-providers';
import { V1ConfigurationUploadService } from 'client';

describe('ZvmComponent', () => {
  let component: ZvmComponent;
  let fixture: ComponentFixture<ZvmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, FormsModule, ReactiveFormsModule],
      declarations: [
        MockComponent('app-zos-zvm-request-modal'),
        MockFontAwesomeComponent,
        MockIconButtonComponent,
        MockNgxSmartModalComponent,
        ZvmComponent,
      ],
      providers: [MockProvider(NgxSmartModalService), MockProvider(V1ConfigurationUploadService)],
    });
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZvmComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
