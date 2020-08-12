import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ZosComponent } from './zos.component';
import { MockFontAwesomeComponent, MockIconButtonComponent } from 'src/test/mock-components';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockProvider } from 'src/test/mock-providers';
import { ZosZvmRequestModalComponent } from 'src/app/common/zos-zvm-request-modal/zos-zvm-request-modal.component';

describe('ZosComponent', () => {
  let component: ZosComponent;
  let fixture: ComponentFixture<ZosComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ZosComponent, ZosZvmRequestModalComponent, MockFontAwesomeComponent, MockIconButtonComponent],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
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
