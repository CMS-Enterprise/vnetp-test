import { HttpClientModule } from '@angular/common/http';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxSmartModalService } from 'ngx-smart-modal';
import { MockFontAwesomeComponent, MockIconButtonComponent, MockNgxSmartModalComponent } from 'src/test/mock-components';
import { MockProvider } from 'src/test/mock-providers';

import { ApEndpointGroupEditModalComponent } from './ap-endpoint-group-edit-modal.component';

describe('ApEndpointGroupEditModalComponent', () => {
  let component: ApEndpointGroupEditModalComponent;
  let fixture: ComponentFixture<ApEndpointGroupEditModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ApEndpointGroupEditModalComponent, MockNgxSmartModalComponent, MockFontAwesomeComponent, MockIconButtonComponent],
      imports: [ReactiveFormsModule, HttpClientModule],
      providers: [MockProvider(NgxSmartModalService)],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApEndpointGroupEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
