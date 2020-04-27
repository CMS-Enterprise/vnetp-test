import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZosZvmRequestModalComponent } from './zos-zvm-request-modal.component';
import { AngularFontAwesomeModule } from 'angular-font-awesome';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalModule, NgxSmartModalService } from 'ngx-smart-modal';
import { NgxSmartModalServiceStub } from '../modal-mock';

describe('ZosZvmRequestModalComponent', () => {
  let component: ZosZvmRequestModalComponent;
  let fixture: ComponentFixture<ZosZvmRequestModalComponent>;

  const ngx = new NgxSmartModalServiceStub();

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, AngularFontAwesomeModule, FormsModule, NgxSmartModalModule, ReactiveFormsModule],
      declarations: [ZosZvmRequestModalComponent],
      providers: [{ provide: NgxSmartModalService, useValue: ngx }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZosZvmRequestModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
