import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZosComponent } from './zos.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgxSmartModalServiceStub } from 'src/app/modals/modal-mock';
import { NgxSmartModalService, NgxSmartModalModule } from 'ngx-smart-modal';
import { NgxPaginationModule } from 'ngx-pagination';
import { ZosZvmRequestModalComponent } from 'src/app/modals/zos-zvm-request-modal/zos-zvm-request-modal.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('ZosComponent', () => {
  let component: ZosComponent;
  let fixture: ComponentFixture<ZosComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [FontAwesomeModule, NgxPaginationModule, NgxSmartModalModule, FormsModule, ReactiveFormsModule, HttpClientTestingModule],
      declarations: [ZosComponent, ZosZvmRequestModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }],
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
