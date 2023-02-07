import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { SubjectEditModalComponent } from './subject-edit-modal.component';

describe('SubjectEditModalComponent', () => {
  let component: SubjectEditModalComponent;
  let fixture: ComponentFixture<SubjectEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SubjectEditModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent, MockIconButtonComponent],
      imports: [HttpClientModule, ReactiveFormsModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SubjectEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
