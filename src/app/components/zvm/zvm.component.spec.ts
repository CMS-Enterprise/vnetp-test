import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ZvmComponent } from './zvm.component';
import { MockFontAwesomeComponent } from 'src/test/mock-components';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ZosZvmRequestModalComponent } from 'src/app/modals/zos-zvm-request-modal/zos-zvm-request-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ZvmComponent', () => {
  let component: ZvmComponent;
  let fixture: ComponentFixture<ZvmComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgxPaginationModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ZvmComponent, ZosZvmRequestModalComponent, MockFontAwesomeComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }],
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
