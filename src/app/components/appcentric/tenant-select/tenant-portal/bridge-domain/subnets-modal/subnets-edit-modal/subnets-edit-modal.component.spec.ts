import { HttpClientModule } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { SubnetsEditModalComponent } from './subnets-edit-modal.component';

describe('SubnetsEditModalComponent', () => {
  let component: SubnetsEditModalComponent;
  let fixture: ComponentFixture<SubnetsEditModalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SubnetsEditModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent, MockIconButtonComponent],
      imports: [ReactiveFormsModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SubnetsEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
