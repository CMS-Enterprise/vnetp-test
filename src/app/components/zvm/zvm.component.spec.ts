import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ZvmComponent } from './zvm.component';
import { MockFontAwesomeComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockProvider } from 'src/test/mock-providers';
import { ZosZvmRequestModalComponent } from 'src/app/common/zos-zvm-request-modal/zos-zvm-request-modal.component';

describe('ZvmComponent', () => {
  let component: ZvmComponent;
  let fixture: ComponentFixture<ZvmComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ZvmComponent, ZosZvmRequestModalComponent, MockFontAwesomeComponent, MockIconButtonComponent],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
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
